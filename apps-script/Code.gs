const BOOKSHELF_RANGE = 'Bookshelf!A1:L';
const BOOKSHELF_COLUMNS = [
  'title', 'author', 'genre', 'status', 'firstReadOn', 'timesRead',
  'rereadDates', 'ratingOutOf10', 'coverUrl', 'review',
];

function doGet(e) {
  const route = e?.parameter?.route || e?.pathInfo;
  if (route !== 'v1/bookshelf') {
    return jsonResponse({ error: 'Unknown route' });
  }

  const workbookId = PropertiesService.getScriptProperties().getProperty('WORKBOOK_ID');
  if (!workbookId) {
    throw new Error('Missing WORKBOOK_ID script property.');
  }

  const result = Sheets.Spreadsheets.Values.get(workbookId, BOOKSHELF_RANGE, {
    valueRenderOption: 'UNFORMATTED_VALUE',
  });
  return jsonResponse(buildBookshelf(result.values || []));
}

function buildBookshelf(values) {
  const bookshelf = { reading: [], wantToRead: [], read: [] };
  const [headers = [], ...rows] = values;
  if (!headers.length) return bookshelf;

  const columns = Object.fromEntries(
    BOOKSHELF_COLUMNS.map(name => [name, headers.indexOf(name)])
  );
  if (Object.values(columns).includes(-1)) {
    throw new Error('The Bookshelf tab is missing an API column.');
  }

  const sectionByStatus = new Map([
    ['Reading', bookshelf.reading],
    ['Want to read', bookshelf.wantToRead],
    ['Read', bookshelf.read],
  ]);

  for (const row of rows) {
    const title = cellText(row[columns.title]);
    const section = sectionByStatus.get(cellText(row[columns.status]));
    if (!title || !section) continue;

    const rereadDates = (cellText(row[columns.rereadDates]) || '')
      .split(',')
      .map(readDate)
      .filter(Boolean);

    section.push({
      title,
      author: cellText(row[columns.author]),
      genre: cellText(row[columns.genre]),
      firstReadOn: readDate(row[columns.firstReadOn]),
      timesRead: cellNumber(row[columns.timesRead]),
      rereadDates,
      ratingOutOf10: cellNumber(row[columns.ratingOutOf10]),
      coverUrl: cellText(row[columns.coverUrl]),
      review: cellText(row[columns.review]),
    });
  }

  // Stable sorting keeps ties and undated books in sheet order.
  bookshelf.read.sort((a, b) => latestReadOn(b).localeCompare(latestReadOn(a)));
  return bookshelf;
}

function latestReadOn(book) {
  return book.rereadDates.reduce(
    (latest, date) => date > latest ? date : latest,
    book.firstReadOn || ''
  );
}

function readDate(value) {
  const date = cellText(value);
  return date && /^\d{4}(-\d{2}(-\d{2})?)?$/.test(date) ? date : null;
}

function cellText(value) {
  return String(value ?? '').trim() || null;
}

function cellNumber(value) {
  const text = cellText(value);
  if (text === null) return null;

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
