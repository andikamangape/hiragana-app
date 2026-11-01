import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

const sounds: Record<string, number> = {
  a: require('../../assets/sounds/kanasound-a.mp3'),
  chi: require('../../assets/sounds/kanasound-chi.mp3'),
  e: require('../../assets/sounds/kanasound-e.mp3'),
  fu: require('../../assets/sounds/kanasound-fu.mp3'),
  ha: require('../../assets/sounds/kanasound-ha.mp3'),
  he: require('../../assets/sounds/kanasound-he.mp3'),
  hi: require('../../assets/sounds/kanasound-hi.mp3'),
  ho: require('../../assets/sounds/kanasound-ho.mp3'),
  i: require('../../assets/sounds/kanasound-i.mp3'),
  ka: require('../../assets/sounds/kanasound-ka.mp3'),
  ke: require('../../assets/sounds/kanasound-ke.mp3'),
  ki: require('../../assets/sounds/kanasound-ki.mp3'),
  ko: require('../../assets/sounds/kanasound-ko.mp3'),
  ku: require('../../assets/sounds/kanasound-ku.mp3'),
  ma: require('../../assets/sounds/kanasound-ma.mp3'),
  me: require('../../assets/sounds/kanasound-me.mp3'),
  mi: require('../../assets/sounds/kanasound-mi.mp3'),
  mo: require('../../assets/sounds/kanasound-mo.mp3'),
  mu: require('../../assets/sounds/kanasound-mu.mp3'),
  n: require('../../assets/sounds/kanasound-n.mp3'),
  na: require('../../assets/sounds/kanasound-na.mp3'),
  ne: require('../../assets/sounds/kanasound-ne.mp3'),
  ni: require('../../assets/sounds/kanasound-ni.mp3'),
  no: require('../../assets/sounds/kanasound-no.mp3'),
  nu: require('../../assets/sounds/kanasound-nu.mp3'),
  o: require('../../assets/sounds/kanasound-o.mp3'),
  ra: require('../../assets/sounds/kanasound-ra.mp3'),
  re: require('../../assets/sounds/kanasound-re.mp3'),
  ri: require('../../assets/sounds/kanasound-ri.mp3'),
  ro: require('../../assets/sounds/kanasound-ro.mp3'),
  ru: require('../../assets/sounds/kanasound-ru.mp3'),
  sa: require('../../assets/sounds/kanasound-sa.mp3'),
  se: require('../../assets/sounds/kanasound-se.mp3'),
  shi: require('../../assets/sounds/kanasound-shi.mp3'),
  so: require('../../assets/sounds/kanasound-so.mp3'),
  su: require('../../assets/sounds/kanasound-su.mp3'),
  ta: require('../../assets/sounds/kanasound-ta.mp3'),
  te: require('../../assets/sounds/kanasound-te.mp3'),
  to: require('../../assets/sounds/kanasound-to.mp3'),
  tsu: require('../../assets/sounds/kanasound-tsu.mp3'),
  u: require('../../assets/sounds/kanasound-u.mp3'),
  wa: require('../../assets/sounds/kanasound-wa.mp3'),
  wo: require('../../assets/sounds/kanasound-wo.mp3'),
  ya: require('../../assets/sounds/kanasound-ya.mp3'),
  yo: require('../../assets/sounds/kanasound-yo.mp3'),
  yu: require('../../assets/sounds/kanasound-yu.mp3'),
};

let player: AudioPlayer | null = null;
let currentRomaji: string | null = null;
let configured = false;
let jaVoiceIndex: number | null | undefined = undefined;

function getPlayer(): AudioPlayer {
  if (!player) {
    player = createAudioPlayer(null);
  }
  return player;
}

async function ensureAudioMode(): Promise<void> {
  if (configured) return;
  configured = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
  } catch {
    configured = false;
  }
}

async function getJapaneseVoice(): Promise<number | null> {
  if (jaVoiceIndex !== undefined) return jaVoiceIndex;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const index = voices.findIndex((voice) =>
      voice.language?.toLowerCase().startsWith('ja'),
    );
    jaVoiceIndex = index >= 0 ? index : null;
  } catch {
    jaVoiceIndex = null;
  }
  return jaVoiceIndex;
}

async function speakRomaji(romaji: string): Promise<boolean> {
  const voiceIndex = await getJapaneseVoice();
  if (voiceIndex === null) return false;
  try {
    await Speech.stop();
    Speech.speak(romaji, { language: 'ja-JP', _voiceIndex: voiceIndex });
    return true;
  } catch {
    return false;
  }
}

export const kanaAudio = {
  async playRomaji(romaji: string): Promise<boolean> {
    const asset = sounds[romaji];
    if (asset == null) {
      return speakRomaji(romaji);
    }
    try {
      await ensureAudioMode();
      const p = getPlayer();
      if (currentRomaji !== romaji) {
        p.replace(asset);
        currentRomaji = romaji;
      } else {
        await p.seekTo(0);
      }
      p.play();
      return true;
    } catch {
      return speakRomaji(romaji);
    }
  },
};

