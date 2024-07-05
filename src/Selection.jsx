import React, { useState, useEffect, useRef } from 'react';
import { ReactReader } from 'react-reader';
import Example from './Sample';

const Selection = () => {
  const [selections, setSelections] = useState([]);
  const [rendition, setRendition] = useState(null);
  const [location, setLocation] = useState(0);
  const renditionRef = useRef(null);

  useEffect(() => {
    if (rendition) {
      function setRenderSelection(cfiRange, contents) {
        const selectedText = rendition.getRange(cfiRange).toString();

        setSelections((prevSelections) => {
          // Check if the selection overlaps with any existing selection
          const overlappingIndex = prevSelections.findIndex(
            (sel) => sel.cfiRange === cfiRange
          );

          if (overlappingIndex !== -1) {
            // Combine the selections if they overlap
            prevSelections[overlappingIndex].text += ' ' + selectedText;
            return [...prevSelections]; // Return a new array to trigger state update
          } else {
            // Add new selection
            return [
              ...prevSelections,
              {
                text: selectedText,
                cfiRange,
              },
            ];
          }
        });

        // Clear selection
        const selection = contents.window.getSelection();
        selection.removeAllRanges();
      }

      rendition.on('selected', setRenderSelection);

      return () => {
        rendition.off('selected', setRenderSelection);
      };
    }
  }, [rendition]);

  // Function to handle displaying the selected text
  const handleShowText = (cfiRange) => {
    rendition.annotations.add(
      'highlight',
      cfiRange,
      null,
      'hl',
      { fill: 'yellow', 'fill-opacity': '0.5', 'mix-blend-mode': 'multiply' }
    );

    setTimeout(() => {
      rendition.annotations.remove(cfiRange, 'highlight');
    }, 3000); // Remove highlight after 3 seconds
  };

  return (
    <Example
      title="Selection example"
      above={
        <div className="border border-gray-400 bg-white min-h-[100px] p-2 rounded">
          <h2 className="font-bold mb-1">Selections</h2>
          <ul className="divide-y divide-gray-400 border-t border-gray-400">
            {selections.map(({ text, cfiRange }, i) => (
              <li key={i} className="p-2">
                <span>{text}</span>
                <button
                  className="underline hover:no-underline text-sm mx-1"
                  onClick={() => handleShowText(cfiRange)}
                >
                  Show
                </button>
                <button
                  className="underline hover:no-underline text-sm mx-1"
                  onClick={() => {
                    // Implement save functionality here
                    alert(`Saving text: ${text}`);
                  }}
                >
                  Save
                </button>
                <button
                  className="underline hover:no-underline text-sm mx-1"
                  onClick={() =>
                    setSelections((prevSelections) =>
                      prevSelections.filter((_, index) => index !== i)
                    )
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <ReactReader
        url="https://react-reader.metabits.no/files/alice.epub"
        title="Alice's Adventures in Wonderland"
        location={location}
        locationChanged={(loc) => setLocation(loc)}
        getRendition={(rendition) => {
          setRendition(rendition);
          renditionRef.current = rendition;
          rendition.themes.default({
            '::selection': {
              background: 'purple',
            },
          });
        }}
      />
    </Example>
  );
};

export default Selection;
