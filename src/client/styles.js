import { html } from 'https://unpkg.com/haunted/haunted.js';

// prettier-ignore
export const staticStyles = html`
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

    .word {
      display: flex;
      /* justify-content: center; */
      padding: 8px 16px 12px;
      border-radius: 4px;
      background-color: #fff;
      box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14),
        0px 1px 3px 0px rgba(0, 0, 0, 0.12);
      /* text-transform: capitalize; */
      user-select: none;
    }

    .word--closed {
      cursor: pointer;
    }

    .word--fail {
      background-color: #37474f;
      color: #fff;
    }

    .word--team-a {
      background-color: #ef9a9a;
    }

    .word--team-b {
      background-color: #81d4fa;
    }

    .word--neutral {
      background-color: #e0e0e0;
    }
  </style>
`;
