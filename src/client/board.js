import { classMap } from 'https://unpkg.com/lit-html/directives/class-map.js';
import { html } from 'https://unpkg.com/haunted/haunted.js';

const getWordTeamIdx = (idx, opened, teamWords, isWordOpened) =>
  isWordOpened(idx, opened) ? teamWords.findIndex(wordIds => wordIds.has(idx)) : null;

const getClosedWordsNum = (teamWords, opened) =>
  [...teamWords].filter(idx => !opened.has(idx)).length;

const teamModifiers = ['team-a', 'team-b'];

const getWordModifier = (idx, opened, fail, teamIdx, isWordOpened) => {
  if (!isWordOpened(idx, opened)) return 'closed';
  if (idx === fail) return 'fail';
  return teamModifiers[teamIdx] ?? 'neutral';
};

const renderWord = (word, modifier) =>
  html`<li class=${classMap({ card: true, [`card--${modifier}`]: true })}>${word}</li>`;

const renderTeamWordCounter = (wordIds, opened, modifier) =>
  html`
    <div class=${classMap({ card: true, [`card--${modifier}`]: true })}>
      ${getClosedWordsNum(wordIds, opened)}
    </div>
  `;

export const renderBoard = ({ words, teamWords, fail }, opened, handleDblClick, isWordOpened) =>
  html`
    <div class="board">
      <ul class="field">
        ${words.map((w, i) => {
          const teamIdx = getWordTeamIdx(i, opened, teamWords, isWordOpened);
          return html`
            <div @dblclick=${e => handleDblClick(e, i)}>
              ${renderWord(w, getWordModifier(i, opened, fail, teamIdx, isWordOpened))}
            </div>
          `;
        })}
      </ul>
      <div class="counters">
        <div class="counters__title">Words left:</div>
        <div class="counters__items">
          ${teamWords.map((ids, i) => renderTeamWordCounter(ids, opened, teamModifiers[i]))}
        </div>
      </div>
    </div>
  `;
