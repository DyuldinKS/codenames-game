import { classMap } from 'https://unpkg.com/lit-html/directives/class-map.js';
import { html, component, useState, useEffect } from 'https://unpkg.com/haunted/haunted.js';

const renderWord = word => html`<li class=${classMap({ card: true })}>${word}</li>`;

const renderBoard = ({ words }) =>
  html`
    <ul class="board">
      ${words.map(renderWord)}
    </ul>
  `;

const renderLoading = () => html`<div>Loading...</div>`;

const App = () => {
  const [game, setGame] = useState(null);
  console.log(game);
  useEffect(() => {
    fetch(`/api/game/${location.pathname.slice(1)}`)
      .then(res => res.json())
      .then(setGame);
  }, []);

  return html`
    ${game ? renderBoard(game) : renderLoading()}
    <style>
      .board {
        display: grid;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
        grid-gap: 12px;
        align-items: center;
        max-width: 920px;
        /* background-color: #defefe; */
        list-style: none;
        font-size: 1.6rem;
        margin: auto;
        padding: 16px;
      }

      @media (max-width: 500px) {
        .board {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
      }

      .card {
        padding: 4px 8px;
        border: 1px solid #555;
        border-radius: 4px;
        background-color: #fff;
      }
    </style>
  `;
};

customElements.define('codenames-app', component(App));
