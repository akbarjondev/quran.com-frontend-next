import React, { useMemo } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import { groupWordsByLineAndVerse } from './groupLinesByVerses';
import Line from './Line';
import styles from './Page.module.scss';
import PageFooter from './PageFooter';

import { selectWordByWordByWordPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { QuranFont } from 'types/QuranReader';
import Verse from 'types/Verse';

type PageProps = {
  verses: Verse[];
  pageNumber: number;
  quranReaderStyles: QuranReaderStyles;
  pageIndex: number;
};

const Page = ({ verses, pageNumber, quranReaderStyles, pageIndex }: PageProps) => {
  const lines = useMemo(
    () => (verses && verses.length ? groupWordsByLineAndVerse(verses) : {}),
    [verses],
  );
  const { quranTextFontScale, quranFont } = quranReaderStyles;
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectWordByWordByWordPreferences,
    shallowEqual,
  );
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  const isBigTextLayout =
    isWordByWordLayout || quranTextFontScale > 3 || quranFont === QuranFont.Tajweed;

  return (
    <div
      id={`page-${pageNumber}`}
      className={classNames(styles.container, { [styles.mobileCenterText]: isBigTextLayout })}
    >
      {Object.values(lines).map((lineData) => (
        <Line
          pageIndex={pageIndex}
          lineData={lineData}
          key={lineData.lineNumber}
          isBigTextLayout={isBigTextLayout}
          quranReaderStyles={quranReaderStyles}
        />
      ))}
      <PageFooter page={pageNumber} />
    </div>
  );
};

export default Page;
