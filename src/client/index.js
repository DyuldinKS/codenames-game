import { classMap } from 'https://unpkg.com/lit-html/directives/class-map.js';
import {
  html,
  component,
  useState,
  useEffect,
  useCallback,
} from 'https://unpkg.com/haunted/haunted.js';
import { staticStyles } from './styles.js';

const GAME_NAME = location.pathname.slice(1);
const API_GAME_PATH = `/api/game/${GAME_NAME}`;

const getWordTeamIdx = (idx, opened, teamWords) =>
  opened.has(idx) ? teamWords.findIndex(wordIds => wordIds.has(idx)) : null;

const wordModifierByTeam = ['team-a', 'team-b'];

const getWordModifier = (idx, opened, fail, teamIdx) => {
  if (!opened.has(idx)) return 'closed';
  if (idx === fail) return 'fail';
  return wordModifierByTeam[teamIdx] ?? 'neutral';
};

const renderWord = (word, className) =>
  html`<li class=${classMap({ word: true, [`word--${className}`]: true })}>${word}</li>`;

const renderBoard = ({ words, teamWords, fail }, opened, handleDblClick) =>
  html`
    <ul class="board">
      ${words.map((w, i) => {
        const teamIdx = getWordTeamIdx(i, opened, teamWords);
        return html`
          <div @dblclick=${e => handleDblClick(e, i)}>
            ${renderWord(w, getWordModifier(i, opened, fail, teamIdx))}
          </div>
        `;
      })}
    </ul>
  `;

const renderLoading = () => html`<div>Loading...</div>`;

const usePermanentCallback = cb => useCallback(cb, []);

const useGameState = initial => {
  const [game, setGame] = useState(initial);
  return [
    game,
    usePermanentCallback(({ words, teamWords, fail }) =>
      setGame({
        words,
        fail,
        teamWords: teamWords.map(ws => new Set(ws)),
      }),
    ),
  ];
};

const useOpenedWordsState = initial => {
  const [opened, setOpened] = useState(initial);
  return [
    opened,
    openedIds => {
      if (openedIds && (opened === null || opened.size === openedIds.length)) {
        setOpened(new Set(openedIds));
      }
    },
  ];
};

const useGameLoading = (setGame, setOpened) => {
  useEffect(() => {
    fetch(API_GAME_PATH)
      .then(res => res.json())
      .then(({ opened, ...game }) => {
        setGame(game);
        setOpened(opened); // dynamic part of the game
      });
    // TODO: return fetch abort
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
  if (opened.has(idx)) return;
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
    ${game && opened ? renderBoard(game, opened, useWordOpeningHandler(opened)) : renderLoading()}
    ${staticStyles}
  `;
}

customElements.define('codenames-app', component(App));
