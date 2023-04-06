import React, { useContext, createContext, useEffect, useState} from "react"
import { createStyleState, createGameState, deepCopify, dictify, randomWordAPI, wordAPI } from "./base"
import { FULL_FLIP_WAIT, INVALID_WAIT, colorScheme, FULL_BOUNCE_WAIT } from "./constants"

const GameContext = createContext()
const { boxDark, boxLight } = colorScheme.Box

export const useGameState = () =>{
    return useContext(GameContext)
}

export function GCProvider({ children }) {

    const [gameState, setGameState] = useState(createGameState)
    const [styleState, setStyleState] = useState(createStyleState)
    const [realWord, setRealWord] = useState()

    //TODO: Better name for states
    const [pauses, setPauses] = useState({ inPlay: true, loading : false})
    const [pos, setPos] = useState({currRow : 0, currBox : 0})
    const [rowStyle, setRowStyle] = useState({ invalidRow : null, flipRow : null, bounceRow : null })

    useEffect(() => {
        const getWord = async() =>{
            setPauses(prev => { return {...prev, loading : true}})
            let output = await randomWordAPI()
            setRealWord(output)
            setPauses(prev => { return {...prev, loading : false}})
        }
        getWord()
    }, [])
 
    //TODO: Storage Capability
    // useEffect(() => {
    //     if( !(sessionStorage.getItem('PriWordle')) ){
    //         const game = {
    //             boardState : gameState.map((arr) => arr.join("")),
    //             realWord : realWord,
    //             currRowIndex : pos.currRow,
    //             inPlay : pauses.inPlay,
    //         }
    //         sessionStorage.setItem('PriWordle', JSON.stringify(game))
    //         console.log("Setted")
    //     }

    //     else{
    //         const data = JSON.parse(sessionStorage.getItem('PriWordle'))
    //         console.table(data)

    //         // // setGameState(prev => data.boardState)
    //         setRealWord(prev => data.realWord)
    //         setPos(prev => ({currRow : data['currRowIndex'], currBox : 0}))
    //         setPauses(prev => ({...pauses, inPlay : data['inPlay']}))
    //     }

    //     return () => {
    //         // sessionStorage.clear()
    //         // alert('Cleared')
    //     }
    // }, [realWord])
    
    function handleKeyChanges(e){
        const key = e.key
        const isLetter = key.length === 1 && /^[A-Za-z]*$/.test(key)

        if(isLetter && pos.currBox < 5){
            updateLetter(key.toUpperCase())
        }
        else if(key === 'Backspace' && pos.currBox > 0){
            deleteLetter()
        }
        else if(key === 'Enter' && pos.currBox === 5){
            checkValidity()
        }
    }

    function updateLetter(key) { 
        const nextState = deepCopify(gameState)
        nextState[pos.currRow][pos.currBox] = key
        setGameState(nextState)
        setPos({...pos, currBox : pos.currBox + 1})
    }


    function deleteLetter(){
        const nextState = deepCopify(gameState)
        nextState[pos.currRow][pos.currBox-1] = ""
        setGameState(nextState)
        setPos({...pos, currBox : pos.currBox - 1})
    }

    function nextRow(){
        if(pos.currRow < 6){
            if(pos.currRow + 1 === 6){
                setPauses(prev => { return {...prev, inPlay : false}})
            }
            setPos({currRow : pos.currRow + 1, currBox : 0})
        }
    }
    
    async function checkValidity() {
        const validWord = await wordAPI(gameState[pos.currRow].join("")) || false
        if(validWord){
            colorMeUp()
            flipRow()
            nextRow()
        }
        else{
            animateInvalidRow()
        }   
    }

    function colorMeUp(){
        const nextState = deepCopify(styleState)
        const row = nextState[pos.currRow]
        const guessArr = [...gameState[pos.currRow]]
        const realDict = dictify(realWord)

        for( let i = 0; i < guessArr.length; i++){
            if( guessArr[i] === realDict.get(i)){
                row[i] = `${boxLight.correct} ${boxDark.correct}`
                realDict.delete(i)
            }
        }    

        if(realDict.size === 0){
            setTimeout(() => {
                setRowStyle(prev => { return {...prev, bounceRow : pos.currRow} })
                setPauses(prev => { return {...prev, loading : true}})
            }, FULL_FLIP_WAIT)
            
            setTimeout(() => {
                setRowStyle(prev => { return {...prev, bounceRow : null} })
                setPauses({loading: false, inPlay : false})
            }, FULL_BOUNCE_WAIT + FULL_FLIP_WAIT)
            setStyleState(nextState)        
            return
        }

        const mapValues = [...realDict.values()]
        for(const key of realDict.keys()){
            if(mapValues.includes(guessArr[key])){
                row[key] = `${boxLight.present} ${boxDark.present}` 
                mapValues.splice(mapValues.indexOf(guessArr[key]),1)
            }
            else{ row[key] = `${boxLight.absent} ${boxDark.absent}` }
        }       
        setStyleState(nextState)        
    }

    function flipRow(){
        setPauses(prev => { return {...prev, loading : true}})
        setRowStyle(prev => { return {...prev, flipRow : pos.currRow}})
        setTimeout(() => {
            setRowStyle(prev => { return {...prev, flipRow : null}})
            setPauses(prev => { return {...prev, loading : false}})
        }, FULL_FLIP_WAIT)
    }

    function animateInvalidRow(){        
        setRowStyle(prev => { return {...prev, invalidRow : pos.currRow}})
        setTimeout(() => {
            setRowStyle(prev => { return {...prev, invalidRow : null}})
        }, INVALID_WAIT)
    }

    const value = {
        gameState,
        styleState,
        realWord,
        pauses,
        pos,
        rowStyle,
        handleKeyChanges,
    }

    return(
        <GameContext.Provider value = {value}>
            { children }
        </GameContext.Provider>
    )
}