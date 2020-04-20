import { html } from 'https://unpkg.com/haunted/haunted.js';

// prettier-ignore
export const staticStyles = html`
  <style>
    :host {
      font-family: 'Roboto', Helvetica, Arial;
      font-size: 1rem;
      margin: 0;
      padding: 0;
    }

    .board {
      max-width: 920px;
      margin: auto;
      padding: 16px;
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
      background-color: var(--white);
      box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14),
        0px 1px 3px 0px rgba(0, 0, 0, 0.12);
      user-select: none;
      font-size: 1.25rem;
    }

    .counters {
      margin-top: 36px;
    }

    .counters__items {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
      grid-gap: 12px;
      margin-top: 8px;
    }

    .btn {
      margin: 4px;
      padding: 8px 16px;
      border: 1px solid var(--dark-grey);
      border-radius: 4px;
      text-decoration: none;
      color: var(--carbon);
      white-space: nowrap;
      text-align: center;
      cursor: pointer;
      background-color: transparent;
      font-size: 1rem;
      font-family: 'Roboto', Helvetica, Arial;
    }

    .btn:hover {
      border: 1px solid var(--dark-blue);;
      background-color: rgba(225, 245, 254, .3);
      color: var(--dark-blue);
    }

    .actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
  </style>
`;

const cssVar = x => `var(--${x})`;
const bgColor = c => ({ backgroundColor: cssVar(c) });

export const cursorPointer = { cursor: 'pointer' };
export const teamStyles = ['blue', 'red', 'yellow'].map(bgColor);
export const failWordStyles = { backgroundColor: cssVar('dark-grey'), color: cssVar('white') };
export const neutralWordStyles = bgColor('light-grey');
