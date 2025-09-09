import { AvatarQuality, ElevenLabsModel, STTProvider, VoiceChatTransport, VoiceEmotion } from "@heygen/streaming-avatar";

export interface HeyGenConfigModel {
    quality: AvatarQuality;
    avatarId: string;
    avatarName: string;
    voiceId: string;
    voiceEmotion: VoiceEmotion;
    elevenlabsModel: ElevenLabsModel;
    knowledgeId: string;
    language: string;
    sttProvider: STTProvider;
    voiceChatTransport: VoiceChatTransport;
}