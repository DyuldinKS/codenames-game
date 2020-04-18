import { html } from 'https://unpkg.com/haunted/haunted.js';

// prettier-ignore
export const staticStyles = html`
  <style>
    :host {
      --white: #ffffff;
      --blue: #b3e5fc;
      --red: #ffcdd2;
      --dark-grey: #616161;
      --snow: #e0e0e0;
    }

    .board {
      max-width: 920px;
      margin: auto;
      padding: 16px;
      font-size: 1.25rem;
    }

    .field {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      grid-gap: 12px;
      align-items: center;
      list-style: none;
      padding: 0;
    }

    @media (max-width: 500px) {
      .field {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      }
    }

    .card {
      padding: 8px 16px 12px;
      border-radius: 4px;
      background-color: #fff;
      box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14),
        0px 1px 3px 0px rgba(0, 0, 0, 0.12);
      user-select: none;
    }

    .counters {
      margin-top: 36px;
    }

    .counters__title {
      font-size: 1rem;
    }

    .counters__items {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
      grid-gap: 12px;
      margin-top: 8px;
    }
  </style>
`;

const cssVar = x => `var(--${x})`;
const bgColor = c => ({ backgroundColor: cssVar(c) });

export const cursorPointer = { cursor: 'pointer' };
export const teamStyles = ['blue', 'red'].map(bgColor);
export const failWordStyles = { backgroundColor: cssVar('dark-grey'), color: cssVar('white') };
export const neutralWordStyles = bgColor('snow');
