port module Main exposing (main)

import Browser
import Html exposing (Html, button, div, span, text)
import Html.Attributes as Attr
import Html.Events exposing (onClick, onDoubleClick)
import Http
import Json.Decode as D exposing (Decoder)
import Json.Encode as E
import List.Extra as ListX
import Regex as RE exposing (Regex)
import RemoteData as RData
import Set exposing (Set)


main : Program String Model Msg
main =
    Browser.element
        { init = init
        , subscriptions = subscriptions
        , update = update
        , view = view
        }



-- MODEL


type alias Model =
    { gameId : Maybe String
    , game : RData.WebData Game
    , role : Role
    }


type alias Game =
    { id : String
    , words : List Word
    , teamWords : List (List WordId)
    , opened : Set WordId
    , fail : WordId
    }


type Role
    = NotDefined
    | SimplePlayer
    | Captain


type alias Word =
    String


type alias WordId =
    Int


initialState : Model
initialState =
    { gameId = Nothing, game = RData.NotAsked, role = NotDefined }


init : String -> ( Model, Cmd Msg )
init pathname =
    { initialState | gameId = extractGameId pathname }
        |> update StartGame



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


type Msg
    = StartGame
    | GetGameResponse (RData.WebData Game)
    | CreateGameResponse (RData.WebData Game)
    | OpenWordRequest WordId
    | OpenWordResponse WordId (RData.WebData ())
    | UpdateOpenedWords (List WordId)
    | UrlUpdate String
    | SetRole Role
    | CopyGameUrl
    | ResetGame
    | ResetRole


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StartGame ->
            case model.gameId of
                Just gameId ->
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
                        , urlSender ("/" ++ game.id)
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
            ( model, Cmd.none )

        SetRole role ->
            ( { model | role = role }, Cmd.none )

        CopyGameUrl ->
            ( model, copyGameUrlSender () )

        ResetGame ->
            ( { initialState | game = RData.Loading }, createGame )

        ResetRole ->
            ( { model | role = NotDefined }, Cmd.none )


updateGameOpenedWords : List WordId -> Game -> Game
updateGameOpenedWords openedWords game =
    { game | opened = Set.fromList openedWords }



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
    D.map5 Game
        (D.field "id" D.string)
        (D.field "words" (D.list D.string))
        (D.field "teamWords" (D.list (D.list D.int)))
        (D.field "opened" (D.map Set.fromList (D.list D.int)))
        (D.field "fail" D.int)


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
                    text (httpErrorToString err)

                RData.Success game ->
                    viewScreenByRole model.role game
    in
    div [ Attr.class "layout" ] [ content ]


httpErrorToString : Http.Error -> String
httpErrorToString err =
    case err of
        Http.BadBody message ->
            message

        Http.BadUrl message ->
            message

        Http.BadStatus status ->
            String.fromInt status ++ ". Failed to fetch a game."

        _ ->
            "Unknown HTTP error"


viewScreenByRole : Role -> Game -> Html Msg
viewScreenByRole role game =
    case role of
        NotDefined ->
            viewRoleSelectionScreen

        SimplePlayer ->
            viewGame game False

        Captain ->
            viewGame game True


viewBtn : List (Html.Attribute msg) -> List (Html msg) -> Html msg
viewBtn attrs nodes =
    button (List.concat [ attrs, [ Attr.class "btn" ] ]) nodes


viewRoleSelectionScreen : Html Msg
viewRoleSelectionScreen =
    div [ Attr.class "role-selection-screen" ]
        [ div [] [ text "Choose a role:" ]
        , viewBtn [ onClick <| SetRole SimplePlayer ] [ text "Simple player" ]
        , viewBtn [ onClick <| SetRole Captain ] [ text "Captain" ]
        ]


viewGame : Game -> Bool -> Html Msg
viewGame game isCaptain =
    div []
        [ div []
            [ div [ Attr.class "header" ] [ viewControls, viewGameId game.id, viewCounters game ] ]
        , viewBoard game isCaptain
        ]


viewControls : Html Msg
viewControls =
    div [ Attr.class "row", Attr.class "controls" ]
        [ viewBtn [ onClick ResetGame ] [ text "New game" ]
        , viewBtn [ onClick ResetRole ] [ text "Reselect role" ]
        ]


viewGameId : String -> Html Msg
viewGameId id =
    div [ Attr.class "row" ]
        [ text "Game id: "
        , span [ Attr.class "id", onClick CopyGameUrl ] [ text id ]
        ]


viewCounters : Game -> Html Msg
viewCounters game =
    div [ Attr.class "row" ]
        [ text "Words left: "
        , List.map (countWordsLeft game) game.teamWords |> viewCountersByTeam
        ]


viewCountersByTeam : List Int -> Html Msg
viewCountersByTeam counters =
    span []
        (getIndexedList counters
            |> List.map
                (\( idx, count ) ->
                    span
                        [ Attr.class ("counter color--team" ++ String.fromInt (idx + 1)) ]
                        [ text <| String.fromInt count ]
                )
            |> List.intersperse (text " | ")
        )


countWordsLeft : Game -> List Int -> Int
countWordsLeft game teamWords =
    List.foldl
        (\wordId acc ->
            if isWordOpened wordId game then
                acc - 1

            else
                acc
        )
        (List.length teamWords)
        teamWords


viewBoard : Game -> Bool -> Html Msg
viewBoard game isCaptain =
    div [ Attr.class "field" ] (List.indexedMap (viewWord game isCaptain) game.words)


viewWord : Game -> Bool -> WordId -> Word -> Html Msg
viewWord game isCaptain id word =
    div
        (List.append
            [ Attr.classList <| getWordClassList id game isCaptain ]
            (if isWordOpened id game then
                []

             else
                [ onDoubleClick <| OpenWordRequest id ]
            )
        )
        [ text word ]


isWordOpened : WordId -> Game -> Bool
isWordOpened wordId game =
    Set.member wordId game.opened


getWordClassList : WordId -> Game -> Bool -> List ( String, Bool )
getWordClassList wordId game isCaptain =
    List.append
        [ ( "card", True ) ]
        (if isCaptain || isWordOpened wordId game then
            [ ( "card--opened", True )
            , ( getWordTeamClass wordId game, wordId /= game.fail )
            , ( "card--fail", wordId == game.fail )
            ]

         else
            []
        )


getWordTeamClass : WordId -> Game -> String
getWordTeamClass wordId game =
    getIndexedList game.teamWords
        |> ListX.find (\( _, teamWords ) -> List.member wordId teamWords)
        |> Maybe.map Tuple.first
        |> teamIdxToClass


teamIdxToClass : Maybe Int -> String
teamIdxToClass mTeamIdx =
    Maybe.map ((++) "team" << String.fromInt << (+) 1) mTeamIdx
        |> Maybe.withDefault "noteam"
        |> (++) "card--"



-- PORTS


port urlSender : String -> Cmd msg


port copyGameUrlSender : () -> Cmd msg


port listenGameUpdates : String -> Cmd msg


port urlChangeListener : (String -> msg) -> Sub msg


port openedWordsListener : (List Int -> msg) -> Sub msg



-- UTILS


getIndexedList : List x -> List ( Int, x )
getIndexedList =
    List.indexedMap Tuple.pair
