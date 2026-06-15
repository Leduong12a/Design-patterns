import type { CandidateEntity } from './candidate.entity';
import { CandidateStatus, VerificationStatus } from './candidate.types';

export interface ICandidateVerificationState {
  verify(candidate: CandidateEntity): string;
  markRisky(candidate: CandidateEntity): string;
}

export class UnverifiedState implements ICandidateVerificationState {
  verify(candidate: CandidateEntity): string {
    candidate.updateVerificationStatus(VerificationStatus.VERIFIED);
    candidate.updateStatus(CandidateStatus.OFFER);
    candidate.setVerificationState(new VerifiedState());
    return 'Kiểm chứng thành công! Chuyển sang Đề nghị.';
  }

  markRisky(candidate: CandidateEntity): string {
    candidate.updateVerificationStatus(VerificationStatus.RISKY);
    candidate.updateStatus(CandidateStatus.APPLIED);
    candidate.setVerificationState(new RiskyState());
    return 'Đánh dấu rủi ro. Reset lại Ứng tuyển.';
  }
}

export class VerifiedState implements ICandidateVerificationState {
  verify(candidate: CandidateEntity): string {
    throw new Error('Ứng viên đã được kiểm chứng rồi.');
  }

  markRisky(candidate: CandidateEntity): string {
    candidate.updateVerificationStatus(VerificationStatus.RISKY);
    candidate.updateStatus(CandidateStatus.APPLIED);
    candidate.setVerificationState(new RiskyState());
    return 'Đánh dấu rủi ro. Reset lại Ứng tuyển.';
  }
}

export class RiskyState implements ICandidateVerificationState {
  verify(candidate: CandidateEntity): string {
    candidate.updateVerificationStatus(VerificationStatus.VERIFIED);
    candidate.updateStatus(CandidateStatus.OFFER);
    candidate.setVerificationState(new VerifiedState());
    return 'Kiểm chứng thành công! Chuyển sang Đề nghị.';
  }

  markRisky(candidate: CandidateEntity): string {
    throw new Error('Ứng viên đã bị đánh dấu rủi ro rồi.');
  }
}

export class CandidateStateFactory {
  static create(status: VerificationStatus): ICandidateVerificationState {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return new VerifiedState();
      case VerificationStatus.RISKY:
        return new RiskyState();
      case VerificationStatus.UNVERIFIED:
      default:
        return new UnverifiedState();
    }
  }
}
