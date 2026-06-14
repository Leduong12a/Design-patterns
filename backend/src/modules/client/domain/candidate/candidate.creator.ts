import { CandidateEntity } from './candidate.entity';
import type { ICandidateProps, ICandidate } from './candidate.types';
import { CandidateStatus, VerificationStatus } from './candidate.types';

// Creator (abstract) — khai báo factory method, chứa business logic dùng chung
export abstract class CandidateCreator {
  abstract createCandidate(props: ICandidateProps): ICandidate;
}

// ConcreteCreatorA — tạo ứng viên mới, validate + set giá trị mặc định
export class NewCandidateCreator extends CandidateCreator {
  createCandidate(props: ICandidateProps): ICandidate {
    if (!props.personal?.email) {
      throw new Error('Domain Error: Không thể tạo ứng viên nếu thiếu Email định danh.');
    }
    if (!props.addedBy) {
      throw new Error('Domain Error: Bắt buộc phải có thông tin người thêm (addedBy).');
    }
    return new CandidateEntity({
      ...props,
      id: null,
      status: CandidateStatus.APPLIED,
      verificationStatus: VerificationStatus.UNVERIFIED,
      isVerify: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// ConcreteCreatorB — khôi phục ứng viên từ database
export class RestoredCandidateCreator extends CandidateCreator {
  createCandidate(props: ICandidateProps): ICandidate {
    return new CandidateEntity(props);
  }
}
