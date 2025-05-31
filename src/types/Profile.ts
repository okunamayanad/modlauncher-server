export interface ProfileData {
  uuid: string;
  username: string;
  accessToken: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateProfileRequest {
  username: string;
  accessToken: string;
}

export interface UpdateProfileRequest {
  uuid: string;
  username?: string;
  accessToken?: string;
}
