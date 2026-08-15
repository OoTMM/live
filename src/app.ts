import { mapKeys } from 'remeda';
import { DATA } from './data';

type GameEventPosition = {
  event: 'position';
  sessionId: string;
  playerId: string;
  worldId: number;
  playerName: string;
  key: number;
  x: number;
  y: number;
  z: number;
};

type GameEvent = GameEventPosition;

type PlayerData = {
  id: string;
  name: string;
  worldId: number;
  pos: [number, number, number];
  key: number;
};

class App {
  private scale: number = 2;
  private images: Map<string, HTMLImageElement> = new Map();
  private players: Map<string, PlayerData> = new Map();
  private canvas: HTMLCanvasElement;
  private canvasCtx: CanvasRenderingContext2D;

  constructor() {
    this.setupSSE();
    this.loadImages();

    const appDiv = document.getElementById('app')!;
    this.canvas = document.createElement('canvas');
    this.canvas.style.border = '1px solid black';
    this.canvas.style.backgroundColor = '#234';
    this.canvas.width = 1500;
    this.canvas.height = 860;
    appDiv.appendChild(this.canvas);
    this.canvasCtx = this.canvas.getContext('2d')!;
  }

  run() {
    this.draw();
  }

  draw() {
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMap();
    this.drawPlayers();
    requestAnimationFrame(() => this.draw());
  }

  private drawMap() {
    /* Draw the background */
    for (const entry of DATA) {
      const img = this.images.get(entry.id);
      if (img) {
        this.canvasCtx.save();
        this.canvasCtx.translate(entry.pos[0] * this.scale, entry.pos[1] * this.scale);
        this.canvasCtx.translate((-img.width / 2) * this.scale, (-img.height / 2) * this.scale);
        if (entry.rot !== 0) {
          this.canvasCtx.rotate(entry.rot * Math.PI * 2);
        }
        this.canvasCtx.drawImage(img, 0, 0, img.width * this.scale, img.height * this.scale);
        this.canvasCtx.restore();
      }
    }
  }

  private drawPlayers() {
    for (const player of this.players.values()) {
      /* Lookup the map data */
      const mapData = DATA.find((d) => d.key === player.key);
      if (!mapData) {
        continue;
      }
      const img = this.images.get(mapData.id);
      if (!img) {
        continue;
      }

      /* Compute local position */
      const localX = (mapData.playerOffset[0] + (player.pos[0] / mapData.playerScale[0])) * 0.1 * 0.4;
      const localY = (-mapData.playerOffset[1] + (player.pos[2] / mapData.playerScale[1])) * 0.1 * 0.4;

      /* Draw the player */
      this.canvasCtx.save();
      this.canvasCtx.translate(mapData.pos[0] * this.scale, mapData.pos[1] * this.scale);
      this.canvasCtx.translate((-img.width / 2) * this.scale, (-img.height / 2) * this.scale);
      this.canvasCtx.translate(localX * this.scale, localY * this.scale);
      if (mapData.rot !== 0) {
        this.canvasCtx.rotate(mapData.rot * Math.PI * 2);
      }
      //this.canvasCtx.translate(player.pos[0] * 0.01, player.pos[2] * 0.01);
      this.canvasCtx.fillStyle = 'red';
      this.canvasCtx.beginPath();
      this.canvasCtx.arc(0, 0, 3, 0, Math.PI * 2);
      this.canvasCtx.fill();
      this.canvasCtx.fillText(player.name, 10, 0);
      this.canvasCtx.restore();
    }
  }

  private loadImages() {
    /* Construct image URLs */
    const imagesUrls = mapKeys(
      import.meta.glob('../assets/maps/**/*.png', { eager: true, as: 'url' }),
      k => k.replace('../assets/maps/', '').replace('.png', '')
    );

    Object.entries(imagesUrls).forEach(([key, url]) => {
      const img = new Image();
      img.src = url;
      this.images.set(key, img);
    });
  }

  private onEvent(ev: GameEvent) {
    if (ev.event === 'position') {
      const playerData: PlayerData = {
        id: ev.playerId,
        name: ev.playerName,
        worldId: ev.worldId,
        pos: [ev.x, ev.y, ev.z],
        key: ev.key,
      };
      this.players.set(ev.playerId, playerData);
    }
  }

  private setupSSE() {
    const url = new URL(window.location.href);
    const sessionId = url.pathname.split('/')[1];
    const sse = new EventSource(`https://api.ootmm.com/multi/sessions/${sessionId}/events`);
    sse.onmessage = (event) => {
      const ev: GameEvent = JSON.parse(event.data);
      this.onEvent(ev);
    };
  }
}

const app = new App();
app.run();
