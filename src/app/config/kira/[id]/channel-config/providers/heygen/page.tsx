"use client";

import Image from "next/image";

import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import {
  AvatarQuality,
  ElevenLabsModel,
  STTProvider,
  VoiceChatTransport,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import { AnimatePresence, motion } from "framer-motion";

import { useParams, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { HeyGenConfigModel } from "@/app/api/interfaces/heygen-config-model";
import { useToast } from "@/hooks/use-toast";
import { Channel } from "@/app/api/interfaces/channel";
import { ArrowLeft } from "phosphor-react";

export default function HeygenConfigPage() {
  const params = useParams();
  const kiraId = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("es");
  const [avatarId, setAvatarId] = useState("Ann_Therapist_public");
  const [knowledgeId, setKnowledgeId] = useState("");
  const [quality, setQuality] = useState<AvatarQuality>(AvatarQuality.Medium);
  const [voiceChatTransport, setVoiceChatTransport] =
    useState<VoiceChatTransport>(VoiceChatTransport.WEBSOCKET);
  const [voiceId, setVoiceId] = useState("");
  const [voiceRate, setVoiceRate] = useState<number | null>(1.5);
  const [voiceEmotion, setVoiceEmotion] = useState<VoiceEmotion>(
    VoiceEmotion.SOOTHING
  );
  const [elevenLabsModel, setElevenLabsModel] = useState<ElevenLabsModel>(
    ElevenLabsModel.eleven_flash_v2_5
  );
  const [sttProvider, setSTTProvider] = useState<STTProvider>(
    STTProvider.DEEPGRAM
  );

  const [loading, setLoading] = useState(false);

  const selectedAvatar = useMemo(() => {
    const avatar = AVATARS.find((avatar) => avatar.avatar_id === avatarId);

    if (!avatar) {
      return {
        isCustom: true,
        name: "Custom Avatar ID",
        avatarId: null,
      };
    } else {
      return {
        isCustom: false,
        name: avatar.name,
        avatarId: avatar.avatar_id,
      };
    }
  }, [avatarId]);

  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const heygenConfig: HeyGenConfigModel = {
      quality: quality,
      avatarId: avatarId,
      avatarName: selectedAvatar.isCustom ? "Custom" : selectedAvatar.name,
      voiceId: voiceId,
      voiceEmotion: voiceEmotion,
      elevenlabsModel: elevenLabsModel,
      knowledgeId: knowledgeId,
      language: language,
      sttProvider: sttProvider,
      voiceChatTransport: voiceChatTransport,
    };

    try {
      const batch = writeBatch(db);

      // 1. Crear documento en heygen-configs
      const heygenRef = doc(collection(db, "heygen-configs"));
      batch.set(heygenRef, heygenConfig);

      // 2. Crear documento en channels con referencia al heygen-config
      const channel: Channel = {
        agentId: kiraId,
        name: name,
        description: description,
        provider: "heygen",
        configId: heygenRef.id,
      };

      const channelRef = doc(collection(db, "channels"));
      batch.set(channelRef, channel);

      // 3. Ejecutar batch
      await batch.commit();
      router.push(`/config/kira/${kiraId}/channel-config`);
      toast({
        title: "Configuración guardada!",
        description: "La configuración se guardó correctamente!",
        className: "bg-green-500 text-white",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "La configuración no se pudo guardar",
        className: "bg-red-500 text-white",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full p-8">
      <div>
        <button
          className="bg-ai-muted/20 hover:bg-ai-muted/30 flex items-center gap-2 py-2 px-3 mb-3 rounded-sm text-sm"
          onClick={() => {
            router.back();
          }}
        >
          <ArrowLeft />
          Volver
        </button>
      </div>
      <div className="w-full max-w-3xl bg-white border border-ai-muted/20 rounded-2xl shadow-sm p-6">
        <div className="flex gap-2 items-center mb-6">
          <Image
            src="/heygen-logo.png"
            width={40}
            height={40}
            alt="HeyGen Logo"
          />
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            HeyGen Avatar
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar's name */}
          <div className="mb-1 space-y-2">
            <Field label="Nombre">
              <Input
                placeholder="Ingrese un nombre para el Avatar"
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </div>
          {/* Avatar's Description */}
          <div className="mb-4 space-y-2">
            <Field label="Descripción">
              <Input
                placeholder="Ingrese una breve descripción"
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>
          {/* Avatar */}
          <h2 className="text-lg font-semibold mb-0 text-dark">
            Avatar Settings
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
            {/* Avatar */}
            <div className="space-y-4">
              <Field
                label="Avatar ID"
                helperText="Seleccione un avatar predefinido o use un custom ID"
              >
                <Select
                  isSelected={(option) =>
                    typeof option === "string"
                      ? !!selectedAvatar?.isCustom
                      : option.avatar_id === selectedAvatar?.avatarId
                  }
                  options={[...AVATARS, "CUSTOM"]}
                  placeholder="Select Avatar"
                  renderOption={(option) => {
                    return typeof option === "string"
                      ? "Custom Avatar ID"
                      : option.name;
                  }}
                  value={
                    selectedAvatar?.isCustom
                      ? "Custom Avatar ID"
                      : selectedAvatar?.name
                  }
                  onSelect={(option) => {
                    console.log(option);
                    if (typeof option === "string") {
                      setAvatarId("");
                    } else {
                      setAvatarId(option.avatar_id);
                    }
                  }}
                />
              </Field>
            </div>
            {/* Language Selection */}
            <div className="space-y-2">
              <Field
                label="Language"
                helperText="Seleccione el idioma de la interacción"
              >
                <Select
                  isSelected={(option) => option.value === language}
                  options={STT_LANGUAGE_LIST}
                  renderOption={(option) => option.label}
                  value={
                    STT_LANGUAGE_LIST.find(
                      (option) => option.value === language
                    )?.label
                  }
                  onSelect={(option) => setLanguage(option.value)}
                />
              </Field>
            </div>
          </div>

          {/* Custom Avatar ID - Full Width */}
          <AnimatePresence>
            {selectedAvatar?.isCustom && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-1">
                  <Input
                    label="Custom Avatar ID"
                    placeholder="Ingrese su custom avatar ID aquí..."
                    value={avatarId || ""}
                    onChange={(e) => setAvatarId(e.target.value)}
                    className="mb-0"
                  />
                  <p className="text-sm text-gray-500">
                    Ingrese el identificador único del custom avatar
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Knowledge Base - Full Width */}
          <div className="mb-4 space-y-2">
            <Field label="Knowledge Base ID (Opcional)">
              <Input
                placeholder="Ingrese un knowledge base ID"
                value={knowledgeId || ""}
                onChange={(e) => setKnowledgeId(e.target.value)}
              />
            </Field>
            <p className="text-sm text-gray-500">
              Opcional: Agrega un knowledge base para dar respuestas sobre un
              contexto especifico
            </p>
          </div>

          {/* Advanced Settings */}
          <h2 className="text-lg font-semibold mb-0 text-dark">
            Voice Settings
          </h2>
          <p className="text-gray-600">
            Customize the avatars voice characteristics
          </p>

          {/* Quality & Transport - Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Field label="Avatar Quality">
                <Select
                  isSelected={(option) => option === quality}
                  options={Object.values(AvatarQuality)}
                  renderOption={(option) => option}
                  value={quality || ""}
                  onSelect={(option) => setQuality(option)}
                />
              </Field>
              <p className="text-sm text-gray-500">
                Higher quality may impact performance
              </p>
            </div>

            <div className="space-y-2">
              <Field label="Chat Mode">
                <Select
                  isSelected={(option) => option === voiceChatTransport}
                  options={Object.values(VoiceChatTransport)}
                  renderOption={(option) => option}
                  value={voiceChatTransport || ""}
                  onSelect={(option) => setVoiceChatTransport(option)}
                />
              </Field>
              <p className="text-sm text-gray-500">
                Choose the transport method for voice communication
              </p>
            </div>
          </div>

          {/* Voice ID - Full Width */}
          <div className="space-y-1">
            <Field label="Voice ID (Optional)">
              <Input
                placeholder="Enter custom voice ID for specific voice characteristics..."
                value={voiceId || ""}
                onChange={(e) => setVoiceId(e.target.value)}
              />
            </Field>
            <p className="text-sm text-gray-500">
              Use a specific voice ID from ElevenLabs or leave empty for default
            </p>
          </div>

          {/* Voice Rate & Emotion - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field
              label="Voice Rate"
              helperText="Speed of speech (0.5 = slow, 2.0 = fast)"
            >
              <Input
                type="number"
                min="0.5"
                max="2"
                step="0.1"
                placeholder="1.0"
                value={voiceRate?.toString() || ""}
                onChange={(e) =>
                  setVoiceRate(parseFloat(e.target.value) || 1.0)
                }
              />
            </Field>

            <Field
              label="Voice Emotion"
              helperText=" Emotional tone for the avatars voice"
            >
              <Select
                isSelected={(option) => option === voiceEmotion}
                options={Object.values(VoiceEmotion)}
                renderOption={(option) => option}
                value={voiceEmotion || ""}
                onSelect={(option) => setVoiceEmotion(option)}
              />
            </Field>
          </div>

          {/* ElevenLabs Model - Full Width */}
          <Field
            label="ElevenLabs Model"
            helperText="Choose the ElevenLabs voice model for text-to-speech"
          >
            <Select
              isSelected={(option) => option === elevenLabsModel}
              options={Object.values(ElevenLabsModel)}
              renderOption={(option) => option}
              value={elevenLabsModel || ""}
              onSelect={(option) => setElevenLabsModel(option)}
            />
          </Field>

          {/* STT Provider - Full Width */}
          <Field
            label="Speech-to-Text Provider"
            helperText="Provider for converting speech to text input"
            className="mt-4"
          >
            <Select
              isSelected={(option) => option === sttProvider}
              options={Object.values(STTProvider)}
              renderOption={(option) => option}
              value={sttProvider || ""}
              onSelect={(option) => setSTTProvider(option)}
            />
          </Field>

          <div className="mt-10 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-3 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
