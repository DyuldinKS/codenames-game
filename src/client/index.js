import { classMap } from 'https://unpkg.com/lit-html/directives/class-map.js';
import {
  html,
  component,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'https://unpkg.com/haunted/haunted.js';

const GAME_NAME = location.pathname.slice(1);
const API_GAME_PATH = `/api/game/${GAME_NAME}`;

const renderWord = word => html`<li class=${classMap({ card: true })}>${word}</li>`;

const renderBoard = ({ words }, handleDblClick) =>
  html`
    <ul class="board">
      ${words.map(
        (w, i) => html`
          <div @dblclick=${e => handleDblClick(e, i)}>
            ${renderWord(w)}
          </div>
        `,
      )}
    </ul>
  `;

const renderLoading = () => html`<div>Loading...</div>`;

const subscribe = setGame => {
  const evtSource = new EventSource(`${API_GAME_PATH}/subscribe`);

  evtSource.onmessage = event => {
    console.log('SSE onmessage', event);
    // setGame(event);
    // subscribe(setGame);
  };

  evtSource.addEventListener('opened', msg => {
    console.log('SSE opened', msg);
    setGame(JSON.parse(msg.data));
  });
};

function App() {
  const [game, setGame] = useState(null);
  const gameRef = useRef(null);
  gameRef.current = game;
  console.log(game);

  useEffect(() => {
    fetch(API_GAME_PATH)
      .then(res => res.json())
      .then(setGame);
  }, []);

  useEffect(() => {
    const evtSource = new EventSource(`${API_GAME_PATH}/subscribe`);

    evtSource.addEventListener('opened', msg => {
      console.log('SSE opened', msg);
      setGame({ ...gameRef.current, opened: JSON.parse(msg.data) });
    });
  }, []);

  const handleDblClick = useCallback(
    (e, idx) => {
      fetch(`${API_GAME_PATH}/open`, {
        method: 'POST',
        body: JSON.stringify({ idx }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(({ opened }) => {
          setGame({ ...game, opened });
        });
    },
    [game],
  );

  return html`
    ${game ? renderBoard(game, handleDblClick) : renderLoading()}
    <style>
      .board {
        display: grid;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
        grid-gap: 12px;
        align-items: center;
        max-width: 920px;
        list-style: none;
        font-size: 1.25rem;
        margin: auto;
        padding: 16px;
      }

      @media (max-width: 500px) {
        .board {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
      }

      .card {
        display: flex;
        /* justify-content: center; */
        padding: 8px 16px 12px;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14),
          0px 1px 3px 0px rgba(0, 0, 0, 0.12);
        /* text-transform: capitalize; */
        cursor: pointer;
      }
    </style>
  `;
}

customElements.define('codenames-app', component(App));
