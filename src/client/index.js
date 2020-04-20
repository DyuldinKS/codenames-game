import { html, component, useState, useEffect } from 'https://unpkg.com/haunted/haunted.js';
import { renderBoard } from './board.js';
import { staticStyles } from './styles.js';
import { IS_ADMIN, API_GAME_PATH } from './constants.js';

const isWordOpened = (idx, opened) => opened.has(idx) || IS_ADMIN;

const renderLoading = () => html`<div>Loading...</div>`;

const useGameState = initial => {
  const [game, setGame] = useState(initial);
  return [
    game,
    ({ words, teamWords, fail }) =>
      setGame({
        words,
        fail,
        teamWords: teamWords.map(ws => new Set(ws)),
      }),
  ];
};

const useOpenedWordsState = initial => {
  const [opened, setOpened] = useState(initial);
  return [
    opened,
    openedIds => {
      if (!opened || (openedIds && opened.size === openedIds.length)) {
        setOpened(new Set(openedIds));
      }
    },
  ];
};

const useGameLoading = (setGame, setOpened) => {
  useEffect(() => {
    const controller = new AbortController();
    fetch(API_GAME_PATH, { signal: controller.signal })
      .then(res => res.json())
      .then(({ opened, ...game }) => {
        setGame(game);
        setOpened(opened); // dynamic part of the game
      });

    return () => controller.abort();
  }, []);
};

const useSubscriptionToOpenedWords = setOpened => {
  useEffect(() => {
    const evtSource = new EventSource(`${API_GAME_PATH}/subscribe`);
    let openedWords = [];

    // message of opening new words
    evtSource.addEventListener('opened', msg => {
      openedWords = JSON.parse(msg.data);
      setOpened(openedWords);
    });

    evtSource.addEventListener('error', () => {
      setOpened(null);
    });
  }, []);
};

const useWordOpeningHandler = opened => (e, idx) => {
  if (isWordOpened(idx, opened)) return;
  fetch(`${API_GAME_PATH}/open`, {
    method: 'POST',
    body: JSON.stringify({ idx }),
    headers: { 'Content-Type': 'application/json' },
  });
};

function App() {
  const [game, setGame] = useGameState(null);
  const [opened, setOpened] = useOpenedWordsState(null);
  console.log('RENDER', opened, game);

  useGameLoading(setGame, setOpened);
  useSubscriptionToOpenedWords(setOpened);

  return html`
    ${game && opened
      ? renderBoard(game, opened, useWordOpeningHandler(opened), isWordOpened)
      : renderLoading()}
    ${staticStyles}
  `;
}

customElements.define('codenames-app', component(App));
