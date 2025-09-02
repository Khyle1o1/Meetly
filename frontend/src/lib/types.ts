import faceToFaceLogo from "@/assets/face-to-face.svg";

export enum VideoConferencingPlatform {
  FACE_TO_FACE = "FACE_TO_FACE",
}

export const locationOptions = [
  {
    label: "Face to Face",
    value: VideoConferencingPlatform.FACE_TO_FACE,
    logo: faceToFaceLogo,
    isAvailable: true,
  },
];
