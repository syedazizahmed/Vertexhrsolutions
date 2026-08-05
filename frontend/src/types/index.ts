export interface Job {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  company: string;
  companyLogo?: string;
  location: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
  salary?: string;
  experience?: string;
  qualification?: string;
  tags: string[];
  applyLink?: string;
  coverImage?: string;
  deadline?: string;
  isActive: boolean;
  author: { name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  job: { _id: string; title: string; company: string; location?: string; slug?: string; jobType?: string; isActive?: boolean };
  name: string;
  email: string;
  phone: string;
  resume?: string;
  coverLetter?: string;
  linkedin?: string;
  portfolio?: string;
  location?: string;
  experience?: string;
  currentCompany?: string;
  currentCTC?: string;
  expectedCTC?: string;
  noticePeriod?: string;
  status: 'New' | 'Reviewed' | 'Shortlisted' | 'Rejected';
  createdAt: string;
}

export interface Seeker {
  name: string;
  email: string;
  interestTags: string[];
  viewedJobs: { job: Pick<Job, '_id' | 'title' | 'slug' | 'tags'>; viewedAt: string }[];
}

export interface PaginatedJobs {
  jobs: Job[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface PaginatedApplications {
  applications: Application[];
  totalPages: number;
  currentPage: number;
  total: number;
}
