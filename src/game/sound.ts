type SoundName = 'select' | 'swap' | 'hint' | 'complete'

let audioContext: AudioContext | null = null
let ambientOscillators: OscillatorNode[] = []
let ambientGain: GainNode | null = null

const soundProfiles: Record<SoundName, { frequency: number; duration: number; type: OscillatorType }> = {
  select: { frequency: 360, duration: 0.06, type: 'sine' },
  swap: { frequency: 220, duration: 0.1, type: 'triangle' },
  hint: { frequency: 520, duration: 0.14, type: 'sine' },
  complete: { frequency: 660, duration: 0.3, type: 'sine' },
}

export function playSound(name: SoundName) {
  const AudioContextConstructor = window.AudioContext
  if (!AudioContextConstructor) return

  audioContext ??= new AudioContextConstructor()
  const profile = soundProfiles[name]
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const now = audioContext.currentTime

  oscillator.type = profile.type
  oscillator.frequency.setValueAtTime(profile.frequency, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(now)
  oscillator.stop(now + profile.duration)
  void audioContext.resume()
}

export function startAmbient() {
  const AudioContextConstructor = window.AudioContext
  if (!AudioContextConstructor || ambientOscillators.length > 0) return

  audioContext ??= new AudioContextConstructor()
  ambientGain = audioContext.createGain()
  ambientGain.gain.setValueAtTime(0.0001, audioContext.currentTime)
  ambientGain.gain.exponentialRampToValueAtTime(0.018, audioContext.currentTime + 1.8)
  ambientGain.connect(audioContext.destination)

  ambientOscillators = [174, 220, 261.63].map((frequency, index) => {
    const oscillator = audioContext!.createOscillator()
    oscillator.type = index === 1 ? 'sine' : 'triangle'
    oscillator.frequency.setValueAtTime(frequency, audioContext!.currentTime)
    oscillator.detune.setValueAtTime(index * 3, audioContext!.currentTime)
    oscillator.connect(ambientGain!)
    oscillator.start()
    return oscillator
  })

  void audioContext.resume()
}

export function stopAmbient() {
  if (!audioContext || !ambientGain || ambientOscillators.length === 0) return

  ambientGain.gain.cancelScheduledValues(audioContext.currentTime)
  ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5)
  ambientOscillators.forEach((oscillator) => oscillator.stop(audioContext!.currentTime + 0.55))
  ambientOscillators = []
  ambientGain = null
}
