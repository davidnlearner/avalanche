import { useRef, useEffect, useState } from "react";
import Phaser from "phaser";

import { initGame } from "./game.js";

function App() {
    const gameWindow = useRef(null);

    const [height, setHeight] = useState(6400);
    const [width, setWidth] = useState(800);
    const [game, setGame] = useState(null);

    useEffect(() => {
        setGame(initGame({ gameWindow, height, width }));

        window.addEventListener("resize", () => {
            setHeight(window.innerHeight);
            setWidth(window.innerWidth);
        });
    }, []);

    /*
    useEffect(() => {
        if (game) {
            console.log("running ", game);
            game.scale.resize(width, height);
        }
    }, [height, width]);
    */

    return (
        <div className="App">
            <canvas ref={gameWindow}></canvas>
        </div>
    );
}

export default App;
