import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FaGithub } from "react-icons/fa";


export default function Header() {
  return (
    <header>
      <div>
        <a href="https://github.com/Mvnsour/aerodrop-ui"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub size={24}/>
        </a>
        <h1>AeroDrop</h1>
      </div>
      <ConnectButton />
    </header>
  );
}
