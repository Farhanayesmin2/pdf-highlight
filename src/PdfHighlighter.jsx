import React, { useState, useEffect, useRef } from 'react';
import { ReactReader } from 'react-reader';
import PDFfile from './assets/'
const PdfHighlighter = () => {
  const [highlights, setHighlights] = useState([]);
  const [location, setLocation] = useState(0);
  const readerRef = useRef(null);

  useEffect(() => {
    if (readerRef.current) {
      const handleSelection = (cfiRange, contents) => {
        if (readerRef.current) {
          const text = readerRef.current.getRange(cfiRange).toString();
          setHighlights((prevHighlights) => [
            ...prevHighlights,
            { cfiRange, text }
          ]);

          readerRef.current.annotations.add(
            'highlight',
            cfiRange,
            {},
            () => console.log('Highlight added:', cfiRange),
            'hl',
            { fill: 'yellow', 'fill-opacity': '0.5', 'mix-blend-mode': 'multiply' }
          );

          const selection = contents.window.getSelection();
          if (selection) {
            selection.removeAllRanges();
          }
        }
      };

      readerRef.current.on('selected', handleSelection);

      return () => {
        readerRef.current.off('selected', handleSelection);
      };
    }
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <ReactReader
        url="https://react-reader.metabits.no/files/alice.epub"
        location={location}
        locationChanged={(epubcfi) => setLocation(epubcfi)}
        getRendition={(rendition) => {
          readerRef.current = rendition;
        }}
      />
      <div className="w-full p-4 bg-white border-t border-gray-300">
        <h2 className="text-xl font-bold mb-2">Selections</h2>
        <ul className="space-y-2">
          {highlights.map((highlight, index) => (
            <li key={index} className="flex justify-between items-center">
              <span className="flex-grow">{highlight.text}</span>
              <button
                className="ml-2 p-1 bg-blue-500 text-white rounded"
                onClick={() => {
                  if (readerRef.current) {
                    readerRef.current.display(highlight.cfiRange);
                  }
                }}
              >
                Show
              </button>
              <button
                className="ml-2 p-1 bg-red-500 text-white rounded"
                onClick={() => {
                  if (readerRef.current) {
                    readerRef.current.annotations.remove(
                      highlight.cfiRange,
                      'highlight'
                    );
                    setHighlights((prevHighlights) =>
                      prevHighlights.filter(
                        (h) => h.cfiRange !== highlight.cfiRange
                      )
                    );
                  }
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PdfHighlighter;
