import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { Block, Run } from "@/lib/export/doc-model";
import type { LetterheadSettingsRow } from "@/lib/types/database";

const styles = StyleSheet.create({
  page: {
    paddingTop: 64,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    color: "#17181b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e8ed",
    paddingBottom: 10,
  },
  officeName: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  headerLine: { fontSize: 9, color: "#747d8c" },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 16, textAlign: "center" },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 6 },
  h3: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 12, marginBottom: 5 },
  p: { marginBottom: 8, textAlign: "justify" },
  li: { marginBottom: 4, flexDirection: "row" },
  bullet: { width: 14 },
  quote: {
    borderLeftWidth: 2,
    borderLeftColor: "#e5e8ed",
    paddingLeft: 8,
    marginBottom: 8,
    color: "#747d8c",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 56,
    right: 56,
    borderTopWidth: 1,
    borderTopColor: "#e5e8ed",
    paddingTop: 6,
    fontSize: 8,
    color: "#747d8c",
  },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    right: 56,
    fontSize: 8,
    color: "#747d8c",
  },
});

function RunsText({ runs }: { runs: Run[] }) {
  return (
    <Text>
      {runs.map((run, index) => (
        <Text
          key={index}
          style={{
            fontFamily: run.bold ? "Helvetica-Bold" : run.italic ? "Helvetica-Oblique" : "Helvetica",
            textDecoration: run.underline ? "underline" : undefined,
          }}
        >
          {run.text}
        </Text>
      ))}
    </Text>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return (
        <Text style={block.level <= 2 ? styles.h2 : styles.h3}>
          <RunsText runs={block.runs} />
        </Text>
      );
    case "blockquote":
      return (
        <View style={styles.quote}>
          <Text>
            <RunsText runs={block.runs} />
          </Text>
        </View>
      );
    case "bulletList":
      return (
        <View>
          {block.items.map((item, index) => (
            <View key={index} style={styles.li}>
              <Text style={styles.bullet}>•</Text>
              <Text>
                <RunsText runs={item} />
              </Text>
            </View>
          ))}
        </View>
      );
    case "orderedList":
      return (
        <View>
          {block.items.map((item, index) => (
            <View key={index} style={styles.li}>
              <Text style={styles.bullet}>{index + 1}.</Text>
              <Text>
                <RunsText runs={item} />
              </Text>
            </View>
          ))}
        </View>
      );
    case "divider":
      return <View style={{ borderBottomWidth: 1, borderBottomColor: "#e5e8ed", marginVertical: 12 }} />;
    case "paragraph":
    default:
      return (
        <Text style={styles.p}>
          <RunsText runs={block.runs} />
        </Text>
      );
  }
}

export async function renderLegalDocumentPdf(params: {
  title: string;
  blocks: Block[];
  letterhead: LetterheadSettingsRow | null;
}): Promise<Buffer> {
  const { title, blocks, letterhead } = params;
  const useLetterhead = letterhead?.use_letterhead ?? false;

  const doc = (
    <Document title={title}>
      <Page size="A4" style={styles.page} wrap>
        {useLetterhead && (
          <View style={styles.header} fixed>
            <View>
              <Text style={styles.officeName}>{letterhead?.office_name ?? ""}</Text>
              {letterhead?.lawyer_name && (
                <Text style={styles.headerLine}>
                  {letterhead.lawyer_name}
                  {letterhead.oab_number ? ` · OAB ${letterhead.oab_number}` : ""}
                </Text>
              )}
              {letterhead?.header_text && <Text style={styles.headerLine}>{letterhead.header_text}</Text>}
            </View>
          </View>
        )}

        <Text style={styles.title}>{title}</Text>

        {blocks.map((block, index) => (
          <BlockView key={index} block={block} />
        ))}

        {useLetterhead && (letterhead?.footer_text || letterhead?.address) && (
          <View style={styles.footer} fixed>
            {letterhead?.address && <Text>{letterhead.address}</Text>}
            {letterhead?.footer_text && <Text>{letterhead.footer_text}</Text>}
          </View>
        )}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
