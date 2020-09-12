port module Main exposing (main)

import Browser
import Html exposing (Html, button, div, p, text, h1)
import Html.Events exposing (onClick)
import Html.Attributes as Attr

import Http
import Json.Decode as D exposing (Decoder)

import RemoteData as RData
import Debug

import Regex as RE exposing (Regex)

main =
  Browser.element { init = init, subscriptions = subscriptions, update = update, view = view }


-- MODEL

type alias Model
  = { game: RData.WebData Game
    , pathname: String
    }

type alias Game =
  { id: String
  , words: List String
  , teamWords: List (List Int)
  , opened: List Int
  } 

init : String -> (Model, Cmd Msg)
init pathname =
  { game = RData.NotAsked, pathname = pathname }
    |> update (StartGame pathname)


-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
  urlChangeListener UrlUpdate

getRegex : String -> Regex
getRegex str =
  RE.fromString str
    |> Maybe.withDefault RE.never
  
getRegexFirstMatch : Regex -> String -> Maybe RE.Match
getRegexFirstMatch re =
  List.head << RE.find re

getRegexFirstSubmatch : Maybe RE.Match -> Maybe String
getRegexFirstSubmatch match =
    Maybe.map .submatches match
      |> Maybe.andThen List.head
      |> Maybe.andThen identity

extractGameId : String -> Maybe String
extractGameId =
  getRegexFirstSubmatch << getRegexFirstMatch (getRegex "/([\\w\\d]+)")




-- UPDATE


type Msg
  = GetGameResponse (RData.WebData Game)
  | CreateGameResponse (RData.WebData Game)
  -- | PushUrl String
  | StartGame String
  | UrlUpdate String

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    StartGame pathname ->
      case extractGameId pathname of
        Just gameId ->
          let
            _ = Debug.log "gameId: " gameId
          in
            ( { model | game = RData.Loading }, getGame gameId )
        Nothing ->
          ( { model | game = RData.Loading }, createGame )

    GetGameResponse response ->
      ( { model | game = response }, Cmd.none )

    CreateGameResponse response ->
      let
        cmd = case response of
          RData.Success game ->
            pushUrl game.id
          _ ->
            Cmd.none
        in
          ( { model | game = response }
          , cmd
          )

    UrlUpdate url ->
      let
        _ = Debug.log "update url: "  url
      in
        ( model, Cmd.none )



-- HTTP

gameApi : String -> String
gameApi path =
  "/api/game" ++ path

getGame : String -> Cmd Msg
getGame gameId =
  Http.get
    { url = gameApi ("/" ++ gameId)
    , expect = Http.expectJson (RData.fromResult >> GetGameResponse) gameDecoder
    }

createGame : Cmd Msg
createGame =
  Http.post
    { body = Http.emptyBody
    , url = gameApi ""
    , expect = Http.expectJson (RData.fromResult >> CreateGameResponse) gameDecoder
    }

gameDecoder : Decoder Game
gameDecoder =
  D.map4 Game
    (D.field "id" D.string)
    (D.field "words" (D.list D.string))
    (D.field "teamWords" (D.list (D.list D.int)))
    (D.field "opened" (D.list D.int))



-- VIEW


view : Model -> Html msg
view model =
  let 
    content = case model.game of
      RData.NotAsked -> text "Initialising..."

      RData.Loading -> text "Loading..."

      RData.Failure err -> text (viewHttpError err)

      RData.Success game -> viewGame game
  in
    div [ Attr.class "board" ] [content]

viewHttpError : Http.Error -> String
viewHttpError err =
  case err of
    Http.BadBody message ->
      message
    Http.BadUrl message ->
      message
    Http.BadStatus status ->
      String.fromInt status ++ ". Game not found."
    _ ->
      "Unknown error"

viewGame : Game -> Html msg 
viewGame game =
    div [ Attr.class "field" ] (List.map (\word -> div [ Attr.class "card" ] [text word]) game.words)



-- PORTS


port pushUrl : String -> Cmd msg
port urlChangeListener : (String -> msg)-> Sub msg
