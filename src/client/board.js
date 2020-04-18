import { styleMap } from 'https://unpkg.com/lit-html/directives/style-map.js';
import { html } from 'https://unpkg.com/haunted/haunted.js';
import { cursorPointer, failWordStyles, teamStyles, neutralWordStyles } from './styles.js';
import { GAME_NAME } from './constants.js';

const getWordTeamIdx = (idx, opened, teamWords, isWordOpened) =>
  isWordOpened(idx, opened) ? teamWords.findIndex(wordIds => wordIds.has(idx)) : null;

const getClosedWordsNum = (teamWords, opened) =>
  [...teamWords].filter(idx => !opened.has(idx)).length;

const getWordStyleMap = (idx, opened, fail, teamWords, isWordOpened) =>
  (!isWordOpened(idx, opened) && cursorPointer) ||
  (idx === fail && failWordStyles) ||
  (teamStyles[getWordTeamIdx(idx, opened, teamWords, isWordOpened)] ?? neutralWordStyles);

const renderWord = (word, styles, handleDblClick) =>
  html`
    <li @dblclick=${handleDblClick} class="card" style=${styleMap(styles)}>
      ${word}
    </li>
  `;

const renderTeamWordCounter = (wordIds, opened, styles) =>
  html`
    <div class="card" style=${styleMap(styles)}>
      ${getClosedWordsNum(wordIds, opened)}
    </div>
  `;

const copyToClipBoard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

export const renderBoard = ({ words, teamWords, fail }, opened, handleDblClick, isWordOpened) =>
  html`
    <div class="board">
      <div class="actions">
        <button class="btn" @click=${() => copyToClipBoard(location.href.replace(/\/admin/, ''))}>
          Share
        </button>
        <a href="/" class="btn">New game</a>
      </div>
      <ul class="field">
        ${words.map((w, i) =>
          renderWord(w, getWordStyleMap(i, opened, fail, teamWords, isWordOpened), e =>
            handleDblClick(e, i),
          ),
        )}
      </ul>
      <div class="counters">
        <div class="counters__title">Words left:</div>
        <div class="counters__items">
          ${teamWords.map((ids, i) => renderTeamWordCounter(ids, opened, teamStyles[i]))}
        </div>
      </div>
    </div>
  `;
