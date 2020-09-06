module Main exposing (main)

import Browser
import Html exposing (Html, button, div, p, text, h1)
import Html.Events exposing (onClick)

import Http exposing (Error)
import Json.Decode as D exposing (Decoder)

import RemoteData as RData

main =
  Browser.element { init = init, subscriptions = subscriptions, update = update, view = view }


-- MODEL

type alias Model
  = { game: RData.WebData Game
    , username: String
    }

type alias Game =
  { id: String
  , words: List String
  , teamWords: List (List Int)
  , opened: List Int
  } 

init : () -> (Model, Cmd Msg)
init _ =
  ( { game = RData.Loading, username = "me" }
  , createGame
  )


-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
  Sub.none



-- UPDATE


type Msg
  = GameCreationResponse (RData.WebData Game)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        GameCreationResponse response ->
            ( { model | game = response }
            , Cmd.none
            )



-- HTTP


createGame : Cmd Msg
createGame =
  Http.post
    { 
      body = Http.emptyBody
    , url = "/api/game"
    , expect = Http.expectJson (RData.fromResult >> GameCreationResponse) gameDecoder
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
  case model.game of
    RData.NotAsked -> text "Initialising."

    RData.Loading -> text "Loading."

    RData.Failure err -> text ("Error: " ++  httpErrorToString err)

    RData.Success news -> viewGame news

httpErrorToString : Http.Error -> String
httpErrorToString err =
  case err of
    Http.BadBody error ->
      error
    _ ->
      "unknown error"

viewGame : Game -> Html msg 
viewGame game =
  div []
    [ h1 [] [text game.id]
    , div [] (List.map (\word -> p [] [text word]) game.words)
    ]

