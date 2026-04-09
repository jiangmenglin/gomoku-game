import React from 'react';

export default function Board({ board, onCellClick, lastMove }) {
  return (
    <div className="board-container">
      <div className="board">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div key={r + '-' + c} className="cell" onClick={() => onCellClick(r, c)}>
              {cell !== 0 && (
                <div
                  className={'piece ' + (cell === 1 ? 'piece-black' : 'piece-white')}
                  style={
                    lastMove && lastMove.row === r && lastMove.col === c
                      ? { boxShadow: '0 0 0 3px #ff4757, 2px 2px 5px rgba(0,0,0,0.3)' }
                      : {}
                  }
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}