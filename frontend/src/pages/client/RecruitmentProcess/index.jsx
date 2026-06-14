import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Column from './components/Column';
import candidateService from '../../../services/client/candidateService';
import { ALL_STATES, getStateById } from './states/candidate-state';
import { CandidateStateContext } from './states/candidate-state-context';
import '../../../styles/client/pages/recruitmentBoard.css';

const COLUMNS = ALL_STATES.map(state => ({
  id:         state.id,
  title:      state.label,
  colorClass: state.colorClass,
}));

const STATUS_MAPPING = {
  unverified: 'applied',
  verified:   'screening',
  scheduled:  'interview',
  risky:      'applied',
};

const RecruitmentBoard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await candidateService.getAll();

      const mappedCandidates = (res.candidates || []).map(c => {
        let kanbanStatus = c.status;
        
        if (!getStateById(kanbanStatus)) {
          kanbanStatus = STATUS_MAPPING[kanbanStatus] ?? 'applied';
        }
        return {
          id:            c.id,
          candidateCode: c.id.substring(0, 6).toUpperCase(),
          name:          c.fullName,
          position:      c.jobTitle || 'Chưa cập nhật',
          status:        kanbanStatus,
        };
      });

      setCandidates(mappedCandidates);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách ứng viên!');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (!candidate) {
        toast.error('Không tìm thấy ứng viên!');
        return;
      }

      const context = new CandidateStateContext(candidate.status);
      const result = context.transition(newStatus);

      if (!result.success) {
        toast.error(result.error);
        return;
      }
      
      setCandidates(prev =>
        prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c)
      );

      await candidateService.updateStatus(candidateId, newStatus);
      toast.success('Cập nhật trạng thái thành công!');

      setTimeout(() => fetchCandidates(), 500);

      const syncData = {
        timestamp:   Date.now(),
        candidateId,
        newStatus,
        type:        'candidate-status-changed',
      };
      localStorage.setItem('hr-agent-sync', JSON.stringify(syncData));

      window.dispatchEvent(new CustomEvent('candidate-status-changed', {
        detail: { candidateId, newStatus, timestamp: Date.now() },
      }));

    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
      fetchCandidates();
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="recruitment-page">
      <div className="recruitment-page__header">
        <h1 className="recruitment-page__title">Quy trình tuyển dụng</h1>
      </div>

      <div className="kanban-board">
        {COLUMNS.map(col => {
          const colCandidates = candidates.filter(c => c.status === col.id);
          return (
            <Column
              key={col.id}
              title={col.title}
              colorClass={col.colorClass}
              candidates={colCandidates}
              onStatusChange={handleStatusChange}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RecruitmentBoard;
