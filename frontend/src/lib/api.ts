import {
  AvailabilityType,
  CreateEventPayloadType,
  CreateMeetingType,
  GetAllIntegrationResponseType,
  LoginResponseType,
  loginType,
  PeriodType,
  PublicAvailabilityEventResponseType,
  PublicEventResponseType,
  PublicSingleEventDetailResponseType,
  registerType,
  ToggleEventVisibilityResponseType,
  UserAvailabilityResponseType,
  UserEventListResponse,
  UserMeetingsResponseType,
  PackageResponseType,
  SinglePackageResponseType,
  AssignPackagesToEventType,
  SelectPackageForBookingType,
} from "@/types/api.type";
import { API, PublicAPI } from "./axios-client";
import { IntegrationAppType, VideoConferencingPlatform } from "./types";

export const loginMutationFn = async (
  data: loginType
): Promise<LoginResponseType> => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const registerMutationFn = async (data: registerType) =>
  await API.post("/auth/register", data);

//*********** */ EVENT APIS
export const CreateEventMutationFn = async (data: CreateEventPayloadType) =>
  await API.post("/event/create", data);

export const toggleEventVisibilityMutationFn = async (data: {
  eventId: string;
}): Promise<ToggleEventVisibilityResponseType> => {
  const response = await API.put("/event/toggle-privacy", data);
  return response.data;
};

export const geteventListQueryFn = async (): Promise<UserEventListResponse> => {
  const response = await API.get(`/event/all`);
  return response.data;
};

//*********** */ INTEGRATION APIS

export const checkIntegrationQueryFn = async (
  appType: VideoConferencingPlatform
) => {
  const response = await API.get(`integration/check/${appType}`);
  return response.data;
};

export const getAllIntegrationQueryFn =
  async (): Promise<GetAllIntegrationResponseType> => {
    const response = await API.get(`integration/all`);
    return response.data;
  };

export const connectAppIntegrationQueryFn = async (
  appType: IntegrationAppType
) => {
  const response = await API.get(`integration/connect/${appType}`);
  return response.data;
};

//*********** */ Availability APIS

export const getUserAvailabilityQueryFn =
  async (): Promise<UserAvailabilityResponseType> => {
    const response = await API.get(`/availability/me`);
    return response.data;
  };

export const updateUserAvailabilityMutationFn = async (
  data: AvailabilityType
) => {
  const response = await API.put("/availability/update", data);
  return response.data;
};

//*********** */ Meeting APIS

export const getUserMeetingsQueryFn = async (
  filter: PeriodType
): Promise<UserMeetingsResponseType> => {
  const response = await API.get(
    `/meeting/user/all${filter ? `?filter=${filter}` : ""}`
  );
  return response.data;
};

export const cancelMeetingMutationFn = async (meetingId: string) => {
  const response = await API.put(`/meeting/cancel/${meetingId}`, {});
  return response.data;
};

//*********** */ All EXTERNAL/PUBLIC APIS
export const getAllPublicEventQueryFn = async (
  username: string
): Promise<PublicEventResponseType> => {
  const response = await PublicAPI.get(`/event/public/${username}`);
  return response.data;
};

export const getSinglePublicEventBySlugQueryFn = async (data: {
  username: string;
  slug: string;
}): Promise<PublicSingleEventDetailResponseType> => {
  const response = await PublicAPI.get(
    `/event/public/${data.username}/${data.slug}`
  );
  return response.data;
};

export const getPublicAvailabilityByEventIdQueryFn = async (
  eventId: string,
  timezone?: string
): Promise<PublicAvailabilityEventResponseType> => {
  const response = await PublicAPI.get(`/availability/public/${eventId}`);
  return response.data;
};

//Create Meeting Eventid
export const scheduleMeetingMutationFn = async (data: CreateMeetingType) => {
  const response = await API.post("/meeting/public/create", data);
  return response.data;
};

//*********** */ PACKAGE APIS
export const getPackagesQueryFn = async (): Promise<PackageResponseType> => {
  const response = await API.get("/package");
  return response.data;
};

export const createPackageMutationFn = async (data: any): Promise<SinglePackageResponseType> => {
  console.log("Creating package with data:", data);
  const response = await API.post("/package", data);
  return response.data;
};

export const updatePackageMutationFn = async ({ id, data }: { id: string; data: any }): Promise<SinglePackageResponseType> => {
  const response = await API.put(`/package/${id}`, data);
  return response.data;
};

export const deletePackageMutationFn = async (id: string): Promise<{ message: string }> => {
  const response = await API.delete(`/package/${id}`);
  return response.data;
};

export const assignPackagesToEventMutationFn = async (data: AssignPackagesToEventType): Promise<{ message: string; event: any }> => {
  const response = await API.post("/package/assign-to-event", data);
  return response.data;
};

export const getEventPackagesQueryFn = async (eventId: string): Promise<PackageResponseType> => {
  const response = await API.get(`/package/event/${eventId}`);
  return response.data;
};

export const selectPackageForBookingMutationFn = async ({ meetingId, packageId }: { meetingId: string; packageId: string }): Promise<{ message: string; meeting: any }> => {
  const response = await API.post(`/package/meeting/${meetingId}/select`, { packageId });
  return response.data;
};
