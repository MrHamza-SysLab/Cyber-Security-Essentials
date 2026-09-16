/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import GameContainer from './components/GameContainer';
import { Toaster } from '../components/ui/sonner';
import './index.css';

export default function App() {
  return (
    <>
      <GameContainer />
      <Toaster position="top-center" theme="dark" />
    </>
  );
}
