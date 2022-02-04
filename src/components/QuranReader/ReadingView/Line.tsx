import React, { RefObject, useEffect, memo } from 'react';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { verseFontChanged } from '../utils/memoization';

import styles from './Line.module.scss';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import VerseText from 'src/components/Verse/VerseText';
import useScroll, { SMOOTH_SCROLL_TO_CENTER } from 'src/hooks/useScrollToElement';
import { selectEnableAutoScrolling } from 'src/redux/slices/AudioPlayer/state';
import { selectIsLineHighlighted } from 'src/redux/slices/QuranReader/highlightedLocation';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getWordDataByLocation } from 'src/utils/verse';
import LineData from 'types/LineData';

export type LineProps = {
  lineData: LineData;
  isBigTextLayout: boolean;
  quranReaderStyles: QuranReaderStyles;
  pageIndex: number;
};

const Line = ({ lineData, isBigTextLayout, pageIndex }: LineProps) => {
  const lineVerseKeys = lineData.verseKeys();
  const isHighlighted = useSelector(selectIsLineHighlighted(lineVerseKeys));
  const firstWordOfLine = lineData.words()[0];

  const [scrollToSelectedItem, selectedItemRef]: [() => void, RefObject<HTMLDivElement>] =
    useScroll(SMOOTH_SCROLL_TO_CENTER);
  const enableAutoScrolling = useSelector(selectEnableAutoScrolling);

  useEffect(() => {
    if (isHighlighted && enableAutoScrolling) {
      scrollToSelectedItem();
    }
  }, [isHighlighted, scrollToSelectedItem, enableAutoScrolling]);

  const firstWordData = getWordDataByLocation(firstWordOfLine.location);
  const shouldShowChapterHeader = firstWordData[1] === '1' && firstWordData[2] === '1';

  return (
    <div
      ref={selectedItemRef}
      id={lineData.lineNumber}
      className={classNames(styles.container, {
        [styles.highlighted]: isHighlighted,
        [styles.mobileInline]: isBigTextLayout,
      })}
    >
      {shouldShowChapterHeader && (
        <ChapterHeader
          chapterId={firstWordData[0]}
          pageNumber={firstWordOfLine.pageNumber}
          hizbNumber={firstWordOfLine.hizbNumber}
        />
      )}
      <div className={classNames(styles.line, { [styles.mobileInline]: isBigTextLayout })}>
        {lineVerseKeys.map((key) => (
          <VerseText
            key={key}
            words={lineData.verseWords(key)}
            isReadingMode
            isHighlighted={isHighlighted}
            shouldShowH1ForSEO={pageIndex === 0 && lineData.lineNumber === '0'}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Since we are passing words and it's an array
 * even if the same words are passed, their reference will change
 * on fetching a new page and since Memo only does shallow comparison,
 * we need to use custom comparing logic:
 *
 *  1. Check if the line keys are the same.
 *  2. Check if the number of words are the same.
 *  3. Check if isBigTextLayout values are the same.
 *  4. Check if the font changed.
 *
 * If the above conditions are met, it's safe to assume that the result
 * of both renders are the same.
 *
 * @param {LineProps} prevProps
 * @param {LineProps} nextProps
 * @returns {boolean}
 */
const areLinesEqual = (prevProps: LineProps, nextProps: LineProps): boolean =>
  prevProps.lineData.lineNumber === nextProps.lineData.lineNumber &&
  prevProps.isBigTextLayout === nextProps.isBigTextLayout &&
  !verseFontChanged(
    prevProps.quranReaderStyles,
    nextProps.quranReaderStyles,
    prevProps.lineData.words(),
    nextProps.lineData.words(),
  );

export default memo(Line, areLinesEqual);
