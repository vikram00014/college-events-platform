export class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {}

  constructor() {
    if (typeof window !== 'undefined') {
      // Create audio elements
      this.sounds.click = new Audio('/sounds/click.mp3')
      this.sounds.success = new Audio('/sounds/success.mp3')
      this.sounds.notification = new Audio('/sounds/notification.mp3')
      
      // Set volumes
      Object.values(this.sounds).forEach(sound => {
        sound.volume = 0.1
      })
    }
  }

  play(soundName: string) {
    const sound = this.sounds[soundName]
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(() => {}) // Ignore autoplay policy errors
    }
  }
}

export const soundManager = new SoundManager()
