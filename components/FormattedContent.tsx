import React from "react";
import ReactMarkdown from "react-markdown";

const FormattedContent = ({ children }: { children: string }) => {
  const styles = {
    container: {
      // fontFamily: "Inter",
      lineHeight: "1.6",
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
    },
    title: {
      // fontFamily: "Inter",
      borderBottom: "2px solid #333",
      paddingBottom: "10px",
      fontWeight: "bolder",
      fontSize: "1.3rem",
    },
    section: {
      marginBottom: "20px",
      paddingTop: "10px",
    },
    sectionTitle: {
      fontWeight: "bold",
      marginBottom: "10px",
    },
    list: {
      paddingLeft: "20px",
    },
    heading: {
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <h2 style={styles.heading} {...props} />,
          h2: ({ node, ...props }) => <h2 style={styles.title} {...props} />,
          h3: ({ node, ...props }) => (
            <h3 style={styles.sectionTitle} {...props} />
          ),
          ul: ({ node, ...props }) => <ul style={styles.list} {...props} />,
          p: ({ node, ...props }) => <p style={styles.section} {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedContent;
