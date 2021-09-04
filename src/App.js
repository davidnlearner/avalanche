import { useRef, useEffect, useState } from "react";

import { initGame } from "./game.js";

function App() {
    const gameWindow = useRef(null);

    const [height, setHeight] = useState(800);
    const [width, setWidth] = useState(800);
    // eslint-disable-next-line no-unused-vars
    const [game, setGame] = useState(null);

    useEffect(() => {
        setGame(initGame({ gameWindow, height, width }));

        window.addEventListener("resize", () => {
            setHeight(window.innerHeight);
            setWidth(window.innerWidth);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
