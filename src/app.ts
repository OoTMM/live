import { mapKeys } from 'remeda';
import { DATA } from './data';

class App {
  private images: Map<string, HTMLImageElement> = new Map();
  private canvas: HTMLCanvasElement;
  private canvasCtx: CanvasRenderingContext2D;

  constructor() {
    this.loadImages();

    const appDiv = document.getElementById('app')!;
    this.canvas = document.createElement('canvas');
    this.canvas.style.border = '1px solid black';
    this.canvas.style.backgroundColor = '#234';
    this.canvas.width = 800;
    this.canvas.height = 600;
    appDiv.appendChild(this.canvas);
    this.canvasCtx = this.canvas.getContext('2d')!;
  }

  run() {
    this.draw();
  }

  draw() {
    /* Draw the background */
    for (const entry of DATA) {
      const img = this.images.get(entry.id);
      if (img) {
        this.canvasCtx.save();
        this.canvasCtx.translate(entry.pos[0], entry.pos[1]);
        this.canvasCtx.translate(-img.width / 2, -img.height / 2);
        if (entry.rot !== 0) {
          this.canvasCtx.rotate(entry.rot * Math.PI * 2);
        }
        this.canvasCtx.drawImage(img, 0, 0);
        this.canvasCtx.restore();
      }
    }
    requestAnimationFrame(() => this.draw());
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

    console.log(this.images);
  }
}

const app = new App();
app.run();
