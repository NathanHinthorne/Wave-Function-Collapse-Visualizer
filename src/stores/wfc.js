// stores/counter.js
import { defineStore } from 'pinia'

// I know this amount of complexity in a store is bad practice, but I'm trying to avoid two things:
//   1. Making an actual API for the WFC algorithm.
//   2. Splitting up the WFC logic into separate vue components with their own state and logic. 

export const useWfcStore = defineStore('wfc', () => {

    /** 2D Array. Contains tile objects taken from the input image */
    let inputGrid = [];

    /** 2D Array. Contains cells that get collapsed into tiles */
    let outputGrid = [];

    /** The types of tiles that can be used in the output grid */
    let tileVariants = [];


    // Backtracking variables

    /** A stack of previous output grid states to allow for backtracking */
    let gridStates = [];

    /** A stack of cell collapsing decisions made by the program to allow for backtracking */
    let decisions = [];


    // Analysis variables

    /** The number of times the program has backtracked */
    let backtrackAttempts = 0;

    /** The number of iterations of WFC it takes to fully populate the output grid */
    let totalCycleCount = 1;

    /** The number of times WFC has backtracked to fully populate the output grid */
    let totalBacktracks = 0;

    let completionProgress = 0;

    let totalProgramExecutions = 1;


    const logs = [];
    function myLogger(...args) {
        // Call the original console.log function
        console.log.apply(console, args);

        // Add the log to the logs array
        logs.push(args.join(' '));
    }



    let dim = 10;
    let tilePixelSize = 22;

    let inputImage = null;

    // Flags to keep track of the state of the program
    let imageIsAnalyzed = false;
    let outputIsInitialized = false;
    let outputIsGenerating = false;
    let outputIsComplete = false;


    function preload() {
        inputImage = loadImage('assets/sample_input/demo7.png');
    }

    function setup() {
        parseImage(); // parse the example image
        setupView();

        frameRate(60);

        myLogger("Grid size, Backtracks");
    }



    function draw() {

        displayInputGrid(10, 10, inputImageDisplaySize, inputImageDisplaySize);

        if (imageIsAnalyzed) {
            displayTileVariants(tileVariantDisplayX, tileVariantDisplayY, tileVariantDisplayWidth, tileVariantDisplayHeight);

            // if (optionsIsPressed) {
            displayBehaviors(behaviorDisplayX, behaviorDisplayY, behaviorDisplayWidth, behaviorDisplayHeight);
            // }
        }

        if (outputIsInitialized) {
            displayOutputGrid(outputImageDisplayX, 10, outputImageDisplaySize, outputImageDisplaySize);
        }

        if (outputIsGenerating) {
            populateOutputGrid();
        }
    }


    /**
     * Separate the tiles from the input image into individual 
     * tile objects and store them in the input grid
     */
    function parseImage() {
        inputGrid = [];

        for (let y = 0, row = 0; y < inputImage.height; y += tilePixelSize, row++) {
            inputGrid[row] = [];
            for (let x = 0, col = 0; x < inputImage.width; x += tilePixelSize, col++) {
                // Extract the portion of the image at the given x and y coordinates
                const tileImage = inputImage.get(x, y, tilePixelSize, tilePixelSize);
                const tile = new Tile(tileImage);

                // Add the tile to the input grid
                inputGrid[row][col] = tile;
            }
        }
    }


    function analyzeTiles() {
        findTileVariants();
        findTileNeighbors();
    }

    /**
     * Find all the unique tile variants in the input grid
     */
    function findTileVariants() {
        tileVariants = [];

        /** A set of hashes of tiles that have already been seen by the image parser */
        const scannedTiles = new Set();

        const width = inputGrid[0].length;
        const height = inputGrid.length;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tile = inputGrid[y][x];
                tile.hash = tile.createHash();

                // If this type of tile hasn't been seen, make a new variant
                if (!scannedTiles.has(tile.hash)) {
                    scannedTiles.add(tile.hash);
                    tileVariants.push(tile);
                    tile.index = tileVariants.length - 1;
                    tile.totalFrequencyInGrid = 1;

                } else {
                    // If this type of tile has been seen, find the variant and set the index
                    for (const variant of tileVariants) {
                        if (variant.hash === tile.hash) {
                            tile.index = variant.index;
                            break;
                        }
                    }
                    tile.totalFrequencyInGrid += 1;
                }
            }
        }
    }

    /**
     * Analyze the tiles in the input grid to determine adjacency rules and frequency hints
     */
    function findTileNeighbors() {
        const height = inputGrid.length;
        const width = inputGrid[0].length;


        const mostCommonTile = tileVariants.reduce((mostCommonTile, tile) => {
            if (tile.totalFrequencyInGrid > mostCommonTile.totalFrequencyInGrid) {
                return tile;
            }
            return mostCommonTile;
        });

        const airTiles = tileVariants.reduce((airTiles, tile) => {
            if (tile.behavior === "air") {
                airTiles.push(tile);
            }
            return airTiles;
        }, []);

        let edgeNeighbors = [];

        // check for tiles categorized as "air". Let those override the most common tile
        if (airTiles.length > 0) {
            edgeNeighbors = airTiles;
        } else {
            edgeNeighbors.push(mostCommonTile);
        }

        // create adjacency rules and frequency hints
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tile = inputGrid[y][x]; // the tile we're looking at
                const tileVariant = tileVariants[tile.index]; // the tile to modify

                if (y > 0) { // there's a tile above us
                    const upNeighbor = inputGrid[y - 1][x];
                    if (!tileVariant.up.has(upNeighbor.index)) {
                        tileVariant.up.set(upNeighbor.index, 1);
                    } else {
                        const upNeighborFrequency = tileVariant.up.get(upNeighbor.index);
                        tileVariant.up.set(upNeighbor.index, upNeighborFrequency + 1);
                    }
                }
                else {
                    // there's no tile above us, so let's put artificial constraints on the top side
                    for (const edgeNeighbor of edgeNeighbors) {
                        tileVariant.up.set(edgeNeighbor.index, 1);
                    }
                }

                if (x < width - 1) { // there's a tile to our right
                    const rightNeighbor = inputGrid[y][x + 1];
                    if (!tileVariant.right.has(rightNeighbor.index)) {
                        tileVariant.right.set(rightNeighbor.index, 1);
                    } else {
                        const rightNeighborFrequency = tileVariant.right.get(rightNeighbor.index);
                        tileVariant.right.set(rightNeighbor.index, rightNeighborFrequency + 1);
                    }
                }
                else {
                    // there's no tile to our right, so let's put artificial constraints on the right side
                    for (const edgeNeighbor of edgeNeighbors) {
                        tileVariant.right.set(edgeNeighbor.index, 1);
                    }
                }

                if (y < height - 1) { // there's a tile below us
                    const downNeighbor = inputGrid[y + 1][x];
                    if (!tileVariant.down.has(downNeighbor.index)) {
                        tileVariant.down.set(downNeighbor.index, 1);
                    } else {
                        const downNeighborFrequency = tileVariant.down.get(downNeighbor.index);
                        tileVariant.down.set(downNeighbor.index, downNeighborFrequency + 1);
                    }
                }
                else {
                    // there's no tile below us, so let's put artificial constraints on the bottom side
                    for (const edgeNeighbor of edgeNeighbors) {
                        tileVariant.down.set(edgeNeighbor.index, 1);
                    }
                }

                if (x > 0) { // there's a tile to our left
                    const leftNeighbor = inputGrid[y][x - 1];
                    if (!tileVariant.left.has(leftNeighbor.index)) {
                        tileVariant.left.set(leftNeighbor.index, 1);
                    } else {
                        const leftNeighborFrequency = tileVariant.left.get(leftNeighbor.index);
                        tileVariant.left.set(leftNeighbor.index, leftNeighborFrequency + 1);
                    }
                }
                else {
                    // there's no tile to our left, so let's put artificial constraints on the left side
                    for (const edgeNeighbor of edgeNeighbors) {
                        tileVariant.left.set(edgeNeighbor.index, 1);
                    }
                }
            }
        }
    }


    /**
     * Clear the output grid and create a new cell for each spot on the grid
     */
    function initializeOutputGrid() {
        outputGrid = []; // Clear the output grid

        totalBacktracks = 0;
        totalCycleCount = 1;

        const floorTiles = tileVariants.filter((tile) => tile.behavior == 'floor');

        // Create cell for each spot on the grid
        for (let y = 0; y < dim; y++) { //TODO change this when dims are not equal (not a square grid)
            outputGrid[y] = [];
            for (let x = 0; x < dim; x++) {
                // pass in the indices of the tile variants
                const tileIndices = tileVariants.map(tile => tile.index);
                outputGrid[y][x] = new Cell(tileIndices, x, y);

                // Exclude floor tiles from the options of every cell EXCEPT bottom row
                if (y < dim - 1) {
                    for (const floorTile of floorTiles) {
                        outputGrid[y][x].exclude(floorTile.index);
                    }
                }
            }
        }

        outputIsInitialized = true;
    }


    function restartOutputGrid() {
        outputGrid = [];

        // Create cell for each spot on the grid
        for (let y = 0; y < dim; y++) { //TODO change this when dims are not equal (not a square grid)
            outputGrid[y] = [];
            for (let x = 0; x < dim; x++) {
                // pass in the indices of the tile variants
                const tileIndices = tileVariants.map(tile => tile.index);
                outputGrid[y][x] = new Cell(tileIndices, x, y);
            }
        }

        outputIsInitialized = true;
    }

    /**
     * Collapses a cell into a single tile in a way which respects the local constraints.
     */
    function populateOutputGrid() {

        const gridWidth = outputGrid[0].length;
        const gridHeight = outputGrid.length;

        // Before collapsing a cell, push the current state of the grid to the stack
        saveGridState();

        /* 
        ========================================================================
        Step 1:  Create a list of cells that have not yet been collapsed.
        ========================================================================
        */
        let uncollapsedCells = outputGrid.flat().filter(cell => !cell.collapsed);
        completionProgress = 1 - (uncollapsedCells.length / (dim * dim));

        if (uncollapsedCells.length == 0) {
            outputIsGenerating = false;
            outputIsComplete = true;
            //TODO enable download buttons
            myLogger((dim * dim) + "," + totalBacktracks);
            totalProgramExecutions++;
            return;
        }

        // playPopSfx();

        /*
        ========================================================================
        Step 2: Select the cell with the lowest entropy.
        ========================================================================
        */
        uncollapsedCells = uncollapsedCells.sort((a, b) => a.calculateEntropy() - b.calculateEntropy());

        // break ties in entropy by randomness
        let lowestEntropy = uncollapsedCells[0].calculateEntropy();
        let stopIndex = 0;
        for (let i = 1; i < uncollapsedCells.length; i++) {
            if (uncollapsedCells[i].calculateEntropy() > lowestEntropy) {
                stopIndex = i;
                break;
            }
        }
        if (stopIndex > 0) uncollapsedCells.splice(stopIndex); // cut out all cells with higher entropy
        const cell = random(uncollapsedCells); // pick a random cell that's tied for lowest entropy


        /*
        ========================================================================
        Step 3: Backtrack if necessary
        ========================================================================
        */
        if (cell.options.size == 0) {
            if (backtrackAttempts < 5) {
                // look one steps back
                backtrack(1);
                backtrackAttempts++;

            } else if (backtrackAttempts >= 5 && backtrackAttempts < 10) {
                // look two steps back
                backtrack(2);
                backtrackAttempts++;

            } else if (backtrackAttempts >= 10 && backtrackAttempts < 20) {
                // look five steps back
                backtrack(5);
                backtrackAttempts++;

            } else { // if we've backtracked 20 times, just start over
                restartOutputGrid();
            }
            return;
        }
        backtrackAttempts = 0; // reset the backtrack counter


        /*
        ========================================================================
        Step 4: Collapse the selected cell into a single tile.
        ========================================================================
        */
        cell.collapse();
        const tile = tileVariants[cell.selectedTile];

        decisions.push(new Decision(cell, tile.index));


        /*
        ========================================================================
        Step 5: Update the options fields of the neighboring cells based on the 
                adjacency rules and frequency hints of the collapsed cell's tile.
        ========================================================================
        */
        if (cell.y > 0) { // there's a tile above us
            const upNeighbor = outputGrid[cell.y - 1][cell.x];

            if (!upNeighbor.collapsed) {
                // Remove tile options in neighbor that are not present in this tile's 'up' options.
                // In other words, perform an INTERSECTION between neighbor's options and this tile's 'up' options

                upNeighbor.options.forEach((optionFrequency, optionTile) => {
                    if (!tile.up.has(optionTile)) {
                        upNeighbor.options.delete(optionTile);
                    } else {
                        // Combine the frequencies of the tile options
                        const currentTileFrequency = tile.up.get(optionTile);
                        upNeighbor.options.set(optionTile, optionFrequency + currentTileFrequency);
                    }
                });
            }
        }

        if (cell.x < gridWidth - 1) { // there's a tile to our right
            const rightNeighbor = outputGrid[cell.y][cell.x + 1];

            if (!rightNeighbor.collapsed) {
                // Remove tile options in neighbor that are not present in this tile's 'right' options.
                // In other words, perform an INTERSECTION between neighbor's options and this tile's 'right' options

                rightNeighbor.options.forEach((optionFrequency, optionTile) => {
                    if (!tile.right.has(optionTile)) {
                        rightNeighbor.options.delete(optionTile);
                    } else {
                        // Combine the frequencies of the tile options
                        const currentTileFrequency = tile.right.get(optionTile);
                        rightNeighbor.options.set(optionTile, optionFrequency + currentTileFrequency);
                    }
                });
            }
        }

        if (cell.y < gridHeight - 1) { // there's a tile below us
            const downNeighbor = outputGrid[cell.y + 1][cell.x];

            if (!downNeighbor.collapsed) {
                // Remove tile options in neighbor that are not present in this tile's 'down' options.
                // In other words, perform an INTERSECTION between neighbor's options and this tile's 'down' options

                downNeighbor.options.forEach((optionFrequency, optionTile) => {
                    if (!tile.down.has(optionTile)) {
                        downNeighbor.options.delete(optionTile);
                    } else {
                        // Combine the frequencies of the tile options
                        const currentTileFrequency = tile.down.get(optionTile);
                        downNeighbor.options.set(optionTile, optionFrequency + currentTileFrequency);
                    }
                });
            }
        }

        if (cell.x > 0) { // there's a tile to our left
            const leftNeighbor = outputGrid[cell.y][cell.x - 1];

            if (!leftNeighbor.collapsed) {
                // Remove tile options in neighbor that are not present in this tile's 'left' options.
                // In other words, perform an INTERSECTION between neighbor's options and this tile's 'left' options

                leftNeighbor.options.forEach((optionFrequency, optionTile) => {
                    if (!tile.left.has(optionTile)) {
                        leftNeighbor.options.delete(optionTile);
                    } else {
                        // Combine the frequencies of the tile options
                        const currentTileFrequency = tile.left.get(optionTile);
                        leftNeighbor.options.set(optionTile, optionFrequency + currentTileFrequency);
                    }
                });
            }
        }

        totalCycleCount++;
    }

    // When we backtrack, we restore the state and exclude the previous decision
    function backtrack(steps) {
        const poppedDecisions = [];

        for (let i = 0; i < steps; i++) {
            const decision = decisions.pop();
            poppedDecisions.push(decision);

            gridStates.pop();
        }

        // restore the grid state
        const prevGridState = gridStates[gridStates.length - 1];
        outputGrid = prevGridState.map(row => row.map(cellObj => {
            const cell = Cell.fromObject(cellObj);
            cell.options = new Map(cell.options);
            return cell;
        }));

        // exclude the tile options in the restored grid state
        for (const decision of poppedDecisions) {
            const cell = outputGrid[decision.cell.y][decision.cell.x];
            if (!cell.collapsed) {
                cell.exclude(decision.tileIndex);
            } else {
                initializeOutputGrid();
                break;
            }
        }

        totalBacktracks++;
    }

    /**
     * Save a deep copy of the current grid state to the stack
     */
    function saveGridState() {
        gridStates.push(outputGrid.map(row => row.map(cell => {
            const cellCopy = Object.assign({}, cell);
            cellCopy.options = Array.from(cell.options);
            return cellCopy;
        })));
    }



    // Extra classes

    /**
     * Tiles refer to the individual images that make up the grid. 
     * They contain information about their possible neighboring tiles.
     * 
     * @author Nathan Hinthorne
     */
    class Tile {
        constructor(img) {

            /** The image of the tile */
            this.img = img;

            /** The index of the tile in the tileset */
            this.index = null;

            /** The hash of the tile's pixel data */
            this.hash = null;

            /** Optional field. Tile is treated in a special way depending on the behavior. */
            this.behavior = null;


            // Maps of tile indices to their frequency,
            // This rolls adjacency rules and frequency hints into one

            /** A Map where the keys are the indices of available tiles to appear above this one, and the values are their corresponding frequencies */
            this.up = new Map();

            /** A Map where the keys are the indices of available tiles to appear to the right of this one, and the values are their corresponding frequencies */
            this.right = new Map();

            /** A Map where the keys are the indices of available tiles to appear below this one, and the values are their corresponding frequencies */
            this.down = new Map();

            /** A Map where the keys are the indices of available tiles to appear to the left of this one, and the values are their corresponding frequencies */
            this.left = new Map();
        }

        createHash() {
            // NOTE: Hashing is done to allow for easy comparison of tiles
            //       without having to compare the pixel data directly.
            //       This drastically speeds up the comparison process.


            // Load the pixel data
            this.img.loadPixels();

            // Convert the pixel data to a string
            const pixelDataString = this.img.pixels.join(',');

            // Create a hash of the pixel data string
            let hash = 0;
            for (let i = 0; i < pixelDataString.length; i++) {
                const char = pixelDataString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0; // Convert to 32bit integer
            }

            return hash;
        }
    }


    /**
     * Cells are placed in the output grid and contain the possible tiles that can be placed in that cell.
     * 
     * @author Nathan Hinthorne
     */
    class Cell {

        /**
         * @param {number[]} tileIndices - The indices of the tiles that can be placed in this cell
         * @param {number} x - The x position of the cell in the output grid
         * @param {number} y - The y position of the cell in the output grid
         */
        constructor(tileIndices, x, y) {
            /** The maximum entropy this cell could have over the course of the algorithm */
            this.maxEntropy = tileIndices.length;

            /** This cell's x position in the output grid */
            this.x = x;

            /** This cell's y position in the output grid */
            this.y = y;

            /** Whether or not the cell has collapsed into a tile */
            this.collapsed = false;

            /** The tile index that this cell has collapsed into */
            this.selectedTile = null;

            /** A Map where the keys are the indices of available tiles to choose from, and the values are their corresponding frequencies */
            this.options = new Map();

            // This rolls adjacency rules and frequency hints into one
            // Key: Tile Index, Value: Number of times this tile was found connected to given tile index
            // start off with every tile as an option
            for (let tileIndex of tileIndices) {
                this.options.set(tileIndex, 0);
            }

            this.cachedEntropy = null;
            this.entropyUpdated = false;
        }

        /**
         * Calculates the entropy of the cell based on the tile options available.
         * 
         * @returns {number} The entropy of the cell
         */
        calculateEntropy() {
            if (this.collapsed) {
                return 0;
            }


            // Rough estimate of entropy (not weighted by frequency as with Shannon entropy)
            let entropy = this.options.size;

            this.cachedEntropy = entropy;
            this.entropyUpdated = false;
            return entropy;
        }

        /**
         * Collapse the cell by picking from the tile options, weighted by their frequency
         */
        collapse() {
            if (this.collapsed) {
                throw new Error('Cell has already been collapsed');
            }

            if (this.options.size === 0) {
                throw new Error('Tried to collapse, but no tile options were available')
            }
            // Calculate cumulative frequencies
            let frequencyDistribution = new Map();
            let totalFrequency = 0;
            for (let [tileIndex, frequency] of this.options) {
                totalFrequency += frequency;
                frequencyDistribution.set(tileIndex, totalFrequency);
            }

            // Select a random point in the total frequency range
            let randomFrequency = Math.floor(random(0, totalFrequency));

            // Find the first item which has a cumulative frequency greater than or equal to the random frequency
            let pick = null;
            for (let [tileIndex, cumulativeFrequency] of frequencyDistribution) {
                if (cumulativeFrequency >= randomFrequency) {
                    pick = tileIndex;
                    break;
                }
            }

            this.selectedTile = pick;

            this.options.clear(); // erase all other options

            this.collapsed = true;
        }

        /**
         * @param {number} tileIndex - The index of the tile to exclude from the cell's options
         */
        exclude(tileIndex) {
            if (this.collapsed) {
                throw new Error('Cell has already been collapsed');
            }

            this.options.delete(tileIndex);
        }

        /**  
         * Recreates a cell from a JSON object.
         * Used for backtracking.
         * 
         * @param {Object} obj - The object to recreate the cell from
         * @returns {Cell} - The cell recreated from the object
         */
        static fromObject(obj) {
            let cell = new Cell([], obj.x, obj.y);
            cell.maxEntropy = obj.maxEntropy;
            cell.collapsed = obj.collapsed;
            cell.selectedTile = obj.selectedTile;
            cell.totalFrequencyInGrid = obj.totalFrequencyInGrid;

            for (let [tileIndex, frequency] of obj.options) {
                cell.options.set(tileIndex, frequency);
            }

            return cell;
        }
    }


    /**
     * Represents a decision to collapse a cell into a particular tile.
     * 
     * @author Nathan Hinthorne
     */
    class Decision {
        constructor(cell, tileIndex) {
            this.cell = cell;
            this.tileIndex = tileIndex;
        }
    }




    // Export functions and variables for frontend usage
    return {
        inputGrid,
        outputGrid,
        tileVariants,
        gridStates,
        decisions,
        totalCycleCount,
        totalBacktracks,
        initializeOutputGrid,
        saveGridState,
        backtrack
    }

});