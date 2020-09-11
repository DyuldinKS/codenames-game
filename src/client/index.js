import { createBrowserHistory } from 'history';
import { Elm } from '../Main.elm';
import './styles.css';

const app = Elm.Main.init({
  node: document.getElementById('elm-node'),
});

const history = createBrowserHistory();

app.ports.pushUrl.subscribe(url => {
  history.push(url);
});

history.listen(({ location }) => {
  app.ports.urlChangeListener.send(window.location.origin + location.pathname);
});
