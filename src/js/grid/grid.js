export class GridCell {
  id;
  row;
  col;
  visited;
  isPassable;
  fillColor;
  strokeColor;
  owner;
  currentPrice = 0;
  constructor(
    id,
    row,
    col,
    visited = false,
    isPassable = true,
    fillColor,
    strokeColor,
    owner = "0x0000000000000000000000000000000000000000",
    currentPrice = 0
  ) {
    this.currentPrice = currentPrice;
    this.owner = owner;
    this.id = id;
    this.row = row;
    this.col = col;
    this.visited = visited;
    this.isPassable = isPassable;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    console.log("in constructor");
  }

  color() {
    if (this.fillColor) return this.fillColor;
    else return this.strokeColor;
  }

  toString() {
    return `${this.id}`;
  }
}
export class Grid {
  gridSize; //Size of overall grid in pixel
  cellSize; //Size of individual cell in pixel
  canvasElement;
  context;
  cols;
  rows;
  onCellClick;
  _grid = [];

  constructor(gridSize, cellSize, canvasElement, start, candrawText) {
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    this.canvasElement = canvasElement;
    this.context = canvasElement.getContext("2d");
    this.context.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
    this.rows = 27;
    this.cols = 48;
    console.log("rows: ", this.rows, "cols: ", this.cols, " candrawText: ",candrawText );
    this.initGrid(start);
    this.drawCells(start, candrawText);
  }
  getGrid() {
    return this._grid;
  }
  get(row, col) {
    return this._grid[row][col];
  }

  set(row, col, gridCell, redrawCell = false) {
    const oldGridCell = this._grid[row][col];
    const newGirdCell = Object.assign(oldGridCell, gridCell);
    if (redrawCell) this.redrawCell(newGirdCell);
    return newGirdCell;
  }

  initGrid(start) {
    let counter = start;
    console.log("counter in initGrid: ", counter);
    for (let row = 0; row < this.rows; row++) {
      this._grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this._grid[row][col] = new GridCell(counter++, row, col, false, true);
      }
    }

    this.canvasElement.addEventListener("click", (e) => {
      let x = e.pageX;
      let y = e.pageY;
      x -= this.canvasElement.offsetLeft;
      y -= this.canvasElement.offsetTop;
      const coords = this.canvasToGrid({ x, y });
      const gridCell = this.get(coords.row, coords.col);
      if (this.onCellClick) this.onCellClick(gridCell, e);
    });
  }

  drawCells(start, candrawText) {
    console.log("drawText: ", candrawText);
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const gridCell = this._grid[row][col];
        this.drawRect(gridCell.row, gridCell.col, "white");
        if (candrawText) this.drawText(row, col, `${start++}`);
      }
    }
  }

  getNeighbours(
    gridCell,
    includeDiagonals = false,
    excludeVisitedNeighbours = false,
    excludeClosedNeighbours = false
  ) {
    const x = gridCell.row;
    const y = gridCell.col;

    const top = [x - 1, y];
    const right = [x, y + 1];
    const bottom = [x + 1, y];
    const left = [x, y - 1];

    const topRight = [x - 1, y + 1];
    const bottomRight = [x + 1, y + 1];

    const topLeft = [x - 1, y - 1];
    const bottomLeft = [x + 1, y - 1];

    return [
      top,
      right,
      bottom,
      left,
      ...(includeDiagonals ? [topRight, bottomRight, bottomLeft, topLeft] : []),
    ]
      .filter(([row, col]) => {
        return row >= 0 && col >= 0 && row < this.rows && col < this.cols;
      })
      .map(([row, col]) => {
        return this.get(row, col);
      })
      .filter((gridCell) => {
        if (excludeVisitedNeighbours) return !gridCell.visited;
        else return true;
      })
      .filter((gridCell) => {
        if (excludeClosedNeighbours) return gridCell.isPassable;
        else return true;
      });
  }

  redrawCell(gridCell) {
    const isFilled = gridCell.fillColor !== null;
    if (isFilled) this.fillRect(gridCell.row, gridCell.col, gridCell.fillColor);
    else this.drawRect(gridCell.row, gridCell.col, gridCell.fillColor);
  }

  fillRect(col, row, fillStyle) {
    this.context.fillStyle = fillStyle;
    this.context.fillRect(
      this.cellSize * row,
      this.cellSize * col,
      this.cellSize,
      this.cellSize
    );
  }

  drawRect(row, col, strokeColor) {
    this.context.strokeStyle = strokeColor;
    this.context.beginPath();
    this.context.rect(
      this.cellSize * row,
      this.cellSize * col,
      this.cellSize,
      this.cellSize
    );
    this.context.stroke();
  }

  drawText(col, row, text, style = "black") {
    this.context.font = "8px Arial";
    const fillStyle = this.context.fillStyle;
    this.context.fillStyle = style;
    this.context.fillText(
      `${text}`,
      this.cellSize * row + 2.5,
      this.cellSize * col + 8
    );
    this.context.fillStyle = fillStyle;
  }

  canvasToGrid(e) {
    let x = Math.floor(e.x / this.cellSize);
    let y = Math.floor(e.y / this.cellSize);
    if (x >= 0 && y >= 0 && x < this.rows && y < this.cols) {
      return { row: y, col: x };
    } else return null;
  }
}
