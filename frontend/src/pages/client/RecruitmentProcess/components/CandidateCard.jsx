import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CandidateStateContext } from '../states/candidate-state-context';

const CandidateCard = ({ candidate, onStatusChange }) => {
  const navigate = useNavigate();
  const { id, candidateCode, name, position, status } = candidate;

  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const dragStartRef = useRef({ x: 0, offset: 0 });
  const cardRef = useRef(null);
  const menuRef = useRef(null);
  const menuTriggerRef = useRef(null);
  const isDownRef = useRef(false);

  const context = new CandidateStateContext(status);
  const canSwipeRightToNext = context.canAdvance();
  const canSwipeLeftToPrev  = context.canGoBack();
  
  const handleMouseDown = (e) => {
    isDownRef.current = true;
    dragStartRef.current = { x: e.clientX, offset: 0 };
    setIsDragging(true);
  };

  const handleTouchStart = (e) => {
    isDownRef.current = true;
    dragStartRef.current = { x: e.touches[0].clientX, offset: 0 };
    setIsDragging(true);
  };

  const handleGlobalMouseMove = useCallback((e) => {
    if (!isDownRef.current) return;
    const diff = e.clientX - dragStartRef.current.x;
    dragStartRef.current.offset = diff;
    setSwipeOffset(diff);
  }, []);

  const handleGlobalTouchMove = useCallback((e) => {
    if (!isDownRef.current) return;
    const diff = e.touches[0].clientX - dragStartRef.current.x;
    dragStartRef.current.offset = diff;
    setSwipeOffset(diff);
  }, []);

  const handleEndDrag = useCallback(() => {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    const threshold = 30;
    const offset = dragStartRef.current.offset;

    if (Math.abs(offset) > threshold) {
      
      if (offset > threshold) {
        const result = context.advance();
        if (result.success) onStatusChange(id, result.state.id);
        else toast.error(result.error);
      } else {
        const result = context.goBack();
        if (result.success) onStatusChange(id, result.state.id);
        else toast.error(result.error);
      }
      
    }

    setSwipeOffset(0);
    setIsDragging(false);
  }, [context, id, onStatusChange]);

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('mousemove', handleGlobalMouseMove, false);
    document.addEventListener('mouseup', handleEndDrag, false);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
    document.addEventListener('touchend', handleEndDrag, false);
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleEndDrag);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleEndDrag);
    };
  }, [isDragging, handleGlobalMouseMove, handleGlobalTouchMove, handleEndDrag]);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    if (!menuOpen && menuTriggerRef.current) {
      const rect = menuTriggerRef.current.getBoundingClientRect();
      setPopoverPos({
        top:  rect.bottom + window.scrollY + 4,
        left: rect.right  + window.scrollX,
      });
    }
    setMenuOpen(prev => !prev);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        menuTriggerRef.current && !menuTriggerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const handleStatusSelect = (targetStateId) => {
    
    const result = context.transition(targetStateId);
    if (!result.success) {
      toast.error(result.error);
      setMenuOpen(false);
      return;
    }
    onStatusChange(id, result.state.id);
    
    setMenuOpen(false);
  };

  const getSwipeHint = () => {
    if (swipeOffset > 20) return 'Tiếp tục →';
    if (swipeOffset < -20) return '← Trở về';
    return 'Vuốt để chuyển';
  };

  const currentState = context.getCurrentState();
  const popoverOptions = [
    currentState.getPrevious(),
    currentState,
    currentState.getNext(),
  ].filter(Boolean); 

  const popoverEl = menuOpen ? ReactDOM.createPortal(
    <div
      ref={menuRef}
      className="candidate-card__popover"
      style={{
        position: 'fixed',
        top:  popoverPos.top - window.scrollY,
        left: popoverPos.left,
        transform: 'translateX(-100%)',
        zIndex: 99999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="candidate-card__popover-header">
        Trạng thái mới
      </div>
      <div className="candidate-card__popover-body">
        {popoverOptions.map(st => (
          <button
            key={st.id}
            className={`candidate-card__popover-item ${st.id === status ? 'active' : ''}`}
            onClick={() => handleStatusSelect(st.id)}
          >
            {st.label}
          </button>
        ))}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div
        ref={cardRef}
        className={`candidate-card candidate-card--${status} ${isDragging ? 'candidate-card--dragging' : ''}`}
        style={{
          transform:  `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          cursor:     isDragging ? 'grabbing' : 'grab',
          opacity:    isDragging ? 0.9 : 1,
          touchAction: 'none',
          userSelect: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
        draggable={false}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="candidate-card__header">
          <div className="candidate-card__menu-wrapper" style={{ marginLeft: 'auto' }}>
            <button
              ref={menuTriggerRef}
              className="candidate-card__menu-trigger"
              onClick={handleMenuToggle}
              aria-label="Menu"
            >
              ☰
            </button>
          </div>
        </div>

        <div className="candidate-card__body">
          <p className="candidate-card__field">
            <span className="candidate-card__field-label">Mã :</span>
            <span className="candidate-card__field-value">{candidateCode}</span>
          </p>
          <p className="candidate-card__field">
            <span className="candidate-card__field-label">Họ Tên :</span>
            <span className="candidate-card__field-value">{name}</span>
          </p>
          <p className="candidate-card__field">
            <span className="candidate-card__field-label">Vị trí ứng tuyển:</span>
            <span className="candidate-card__field-value">{position}</span>
          </p>
        </div>

        {isDragging && (
          <div className="candidate-card__swipe-hint">
            {getSwipeHint()}
          </div>
        )}

        <div className="candidate-card__swipe-indicators">
          {canSwipeLeftToPrev && (
            <div className={`candidate-card__indicator candidate-card__indicator--left ${swipeOffset < -20 ? 'active' : ''}`}>
              ←
            </div>
          )}
          {canSwipeRightToNext && (
            <div className={`candidate-card__indicator candidate-card__indicator--right ${swipeOffset > 20 ? 'active' : ''}`}>
              →
            </div>
          )}
        </div>

        <div className="candidate-card__footer">
          <button
            className="candidate-card__btn-detail"
            onClick={(e) => { e.stopPropagation(); navigate(`/candidates/${id}`); }}
          >
            Chi tiết ứng viên
          </button>
        </div>
      </div>

      {popoverEl}
    </>
  );
};

export default CandidateCard;