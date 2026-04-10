export interface StudyNote {
  commentary?: string;
  crossReferences?: string[];
}

type StudyDB = Record<string, Record<number, Record<number, StudyNote>>>;

const data: StudyDB = {
  JHN: {
    3: {
      16: {
        commentary:
          'The most beloved verse in Scripture — God\'s love is universal and unconditional. "Ni" in Ga expresses this total, self-giving love.',
        crossReferences: ['Rom 5:8', '1 John 4:9-10', 'Eph 2:4-5'],
      },
      1: {
        commentary:
          'Nicodemus came by night, perhaps fearing the religious authorities. His curiosity led him to a conversation that changed history.',
        crossReferences: ['John 7:50', 'John 19:39'],
      },
    },
    1: {
      1: {
        commentary:
          'The Logos — the eternal Word — was not created but existed at the very beginning with God and as God.',
        crossReferences: ['Gen 1:1', 'Col 1:15-17', 'Rev 19:13'],
      },
      14: {
        commentary:
          'The Word became flesh (sarx) — fully human. The incarnation is the pivot of human history.',
        crossReferences: ['Phil 2:6-8', 'Heb 2:14', '1 Tim 3:16'],
      },
    },
  },
  PSA: {
    23: {
      1: {
        commentary:
          'David\'s shepherd psalm. The Lord as shepherd provides, guides, protects, and restores.',
        crossReferences: ['John 10:11', 'Heb 13:20', '1 Pet 2:25'],
      },
    },
    119: {
      105: {
        commentary:
          'God\'s Word is both lamp (immediate step) and light (long-range path). Scripture illuminates the way forward.',
        crossReferences: ['Prov 6:23', '2 Pet 1:19'],
      },
    },
  },
  GEN: {
    1: {
      1: {
        commentary:
          'Bara — created out of nothing. Only God is the subject of this verb in the Hebrew Bible. Time, space, and matter begin here.',
        crossReferences: ['John 1:1-3', 'Col 1:16', 'Heb 11:3'],
      },
    },
  },
  ROM: {
    8: {
      28: {
        commentary:
          'All things — even suffering and hardship — are woven by God into a tapestry of good for those who love Him.',
        crossReferences: ['Gen 50:20', 'Phil 1:6', 'James 1:2-4'],
      },
      38: {
        commentary:
          'Nothing in all creation — death, life, angels, rulers, height, depth — can sever us from the love of God.',
        crossReferences: ['John 10:28-29', 'Phil 4:7'],
      },
    },
  },
};

export function getStudyNote(
  bookId: string,
  chapter: number,
  verse: number,
): StudyNote | null {
  return data[bookId]?.[chapter]?.[verse] ?? null;
}
