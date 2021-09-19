import { registerSW } from 'virtual:pwa-register';
import { Game } from './Game';

registerSW();

const game = new Game();
game.start();
