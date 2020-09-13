port module Main exposing (main)

import Browser
import Debug
import Html exposing (Html, button, div, h1, p, text)
import Html.Attributes as Attr
import Html.Events exposing (onClick, onDoubleClick)
import Http
import Json.Decode as D exposing (Decoder)
import Json.Encode as E
import Regex as RE exposing (Regex)
import RemoteData as RData


main =
    Browser.element { init = init, subscriptions = subscriptions, update = update, view = view }



-- MODEL


type alias Model =
    { game : RData.WebData Game
    , pathname : String
    }


type alias Game =
    { id : String
    , words : List Word
    , teamWords : List (List Int)
    , opened : List Int
    }


init : String -> ( Model, Cmd Msg )
init pathname =
    { game = RData.NotAsked, pathname = pathname }
        |> update (StartGame pathname)



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ urlChangeListener UrlUpdate
        , openedWordsListener UpdateOpenedWords
        ]


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


type alias Word =
    String


type alias WordId =
    Int


type Msg
    = StartGame String
    | GetGameResponse (RData.WebData Game)
    | CreateGameResponse (RData.WebData Game)
    | OpenWordRequest WordId
    | OpenWordResponse WordId (RData.WebData ())
    | UpdateOpenedWords (List WordId)
      -- | PushUrl String
    | UrlUpdate String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StartGame pathname ->
            case extractGameId pathname of
                Just gameId ->
                    let
                        _ =
                            Debug.log "gameId: " gameId
                    in
                    ( { model | game = RData.Loading }, getGame gameId )

                Nothing ->
                    ( { model | game = RData.Loading }, createGame )

        GetGameResponse response ->
            ( { model | game = response }
            , case response of
                RData.Success game ->
                    listenGameUpdates <| apiGameSubscribe game.id

                _ ->
                    Cmd.none
            )

        CreateGameResponse response ->
            ( { model | game = response }
            , case response of
                RData.Success game ->
                    Cmd.batch
                        [ listenGameUpdates <| apiGameSubscribe game.id
                        , pushUrl ("/" ++ game.id)
                        ]

                _ ->
                    Cmd.none
            )

        OpenWordRequest wordId ->
            ( model
            , case model.game of
                RData.Success game ->
                    apiOpenWord game.id wordId

                _ ->
                    Cmd.none
            )

        UpdateOpenedWords openedWords ->
            ( { model | game = RData.map (updateGameOpenedWords openedWords) model.game }, Cmd.none )

        OpenWordResponse wordId response ->
            -- maybe retry on failure?
            ( model, Cmd.none )

        UrlUpdate url ->
            let
                _ =
                    Debug.log "update url: " url
            in
            ( model, Cmd.none )


updateGameOpenedWords : List WordId -> Game -> Game
updateGameOpenedWords openedWords game =
    { game | opened = openedWords }



-- HTTP


apiGame : String -> String
apiGame path =
    "/api/game/" ++ path


apiGameSubscribe : String -> String
apiGameSubscribe gameId =
    apiGame <| gameId ++ "/subscribe"


getGame : String -> Cmd Msg
getGame gameId =
    Http.get
        { url = apiGame gameId
        , expect = Http.expectJson (RData.fromResult >> GetGameResponse) gameDecoder
        }


createGame : Cmd Msg
createGame =
    Http.post
        { url = apiGame ""
        , body = Http.emptyBody
        , expect = Http.expectJson (RData.fromResult >> CreateGameResponse) gameDecoder
        }


gameDecoder : Decoder Game
gameDecoder =
    D.map4 Game
        (D.field "id" D.string)
        (D.field "words" (D.list D.string))
        (D.field "teamWords" (D.list (D.list D.int)))
        (D.field "opened" (D.list D.int))


apiOpenWord : String -> WordId -> Cmd Msg
apiOpenWord gameId wordId =
    Http.post
        { url = apiGame <| gameId ++ "/open"
        , body = Http.jsonBody <| E.object [ ( "idx", E.int wordId ) ]
        , expect = Http.expectWhatever (RData.fromResult >> OpenWordResponse wordId)
        }



-- VIEW


view : Model -> Html Msg
view model =
    let
        content =
            case model.game of
                RData.NotAsked ->
                    text "Initialising..."

                RData.Loading ->
                    text "Loading..."

                RData.Failure err ->
                    text (viewHttpError err)

                RData.Success game ->
                    viewGame game
    in
    div [ Attr.class "board" ] [ content ]


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


viewGame : Game -> Html Msg
viewGame game =
    div [ Attr.class "field" ] (List.indexedMap (viewWord game.id) game.words)


viewWord : String -> WordId -> Word -> Html Msg
viewWord gameId id word =
    div [ Attr.class "card", onDoubleClick <| OpenWordRequest id ] [ text word ]



-- PORTS


port pushUrl : String -> Cmd msg


port listenGameUpdates : String -> Cmd msg


port urlChangeListener : (String -> msg) -> Sub msg


port openedWordsListener : (List Int -> msg) -> Sub msg
