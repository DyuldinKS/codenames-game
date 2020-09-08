import { createBrowserHistory } from 'history';
import { Elm } from '../Main.elm';
import './styles.css';

const history = createBrowserHistory();
const node = document.getElementById('elm-node');

console.log('Node:', node);

const app = Elm.Main.init({
  node: document.getElementById('elm-node'),
});

app.ports.pushUrl.subscribe(url => {
  history.pushState(url);
});
