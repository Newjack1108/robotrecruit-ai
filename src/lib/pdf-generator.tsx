import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#667eea',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    border: '3pt solid #ffffff',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  headerInfoItem: {
    fontSize: 10,
    color: '#ffffff',
    marginBottom: 5,
    width: '48%',
  },
  headerLabel: {
    fontWeight: 'bold',
  },
  summary: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeft: '4pt solid #667eea',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 10,
    lineHeight: 1.5,
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  stat: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 8,
    marginBottom: 8,
    marginRight: '2%',
    borderRadius: 4,
  },
  statText: {
    fontSize: 9,
    color: '#333333',
  },
  statLabel: {
    fontWeight: 'bold',
    color: '#667eea',
  },
  conversationSection: {
    marginTop: 20,
  },
  conversationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottom: '2pt solid #667eea',
  },
  message: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 6,
    borderLeft: '3pt solid',
  },
  userMessage: {
    backgroundColor: '#e3f2fd',
    borderLeftColor: '#2196f3',
  },
  assistantMessage: {
    backgroundColor: '#f3e5f5',
    borderLeftColor: '#9c27b0',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  userSender: {
    color: '#1976d2',
  },
  assistantSender: {
    color: '#7b1fa2',
  },
  messageTime: {
    fontSize: 9,
    color: '#666666',
  },
  messageContent: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
    borderTop: '1pt solid #dddddd',
    paddingTop: 10,
  },
  pageNumber: {
    fontSize: 9,
    color: '#666666',
  },
  // Summary bulletpoint styles
  summarySection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeft: '3pt solid #667eea',
  },
  summaryHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 5,
  },
  bulletPoint: {
    fontSize: 10,
    color: '#667eea',
    marginRight: 10,
    fontWeight: 'bold',
    width: 15,
  },
  bulletText: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.6,
    flex: 1,
  },
  executiveSummary: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.6,
    marginBottom: 10,
  },
  divider: {
    marginVertical: 15,
    borderBottom: '1pt solid #dddddd',
  },
});

interface ConversationPDFProps {
  conversation: {
    id: string;
    bot: {
      name: string;
      slug: string;
      avatarUrl?: string | null;
    };
    messages: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
  };
  user: {
    email: string;
  };
  summary?: {
    executiveSummary: string;
    keyTopics: string[];
    mainTakeaways: string[];
    actionItems: string[];
  };
  includeSummary?: boolean;
}

export const ConversationPDF: React.FC<ConversationPDFProps> = ({ 
  conversation, 
  user, 
  summary,
  includeSummary = false 
}) => {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const userMessages = conversation.messages.filter((m) => m.role === 'user').length;
  const botMessages = conversation.messages.filter((m) => m.role === 'assistant').length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* Bot Avatar */}
          {conversation.bot.avatarUrl && (
            <Image 
              src={conversation.bot.avatarUrl} 
              style={styles.headerAvatar}
            />
          )}
          
          {/* Header Content */}
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {includeSummary ? 'Conversation Summary Report' : 'Conversation Report'}
            </Text>
            <View style={styles.headerInfo}>
              <Text style={styles.headerInfoItem}>
                <Text style={styles.headerLabel}>Bot: </Text>
                {conversation.bot.name}
              </Text>
              <Text style={styles.headerInfoItem}>
                <Text style={styles.headerLabel}>User: </Text>
                {user.email}
              </Text>
              <Text style={styles.headerInfoItem}>
                <Text style={styles.headerLabel}>Date: </Text>
                {date}
              </Text>
              <Text style={styles.headerInfoItem}>
                <Text style={styles.headerLabel}>Messages: </Text>
                {conversation.messages.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>
            This conversation contains {conversation.messages.length} messages between {user.email} and {conversation.bot.name}.
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.stat}>
              <Text style={styles.statText}>
                <Text style={styles.statLabel}>User messages: </Text>
                {userMessages}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statText}>
                <Text style={styles.statLabel}>Bot responses: </Text>
                {botMessages}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statText}>
                <Text style={styles.statLabel}>Started: </Text>
                {new Date(conversation.createdAt).toLocaleString()}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statText}>
                <Text style={styles.statLabel}>Last updated: </Text>
                {new Date(conversation.updatedAt).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* AI-Generated Summary Sections */}
        {includeSummary && summary && (
          <>
            {/* Executive Summary */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryHeader}>Executive Summary</Text>
              <Text style={styles.executiveSummary}>{summary.executiveSummary}</Text>
            </View>

            {/* Key Topics */}
            {summary.keyTopics.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryHeader}>Key Topics Discussed</Text>
                {summary.keyTopics.map((topic, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{topic}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Main Takeaways */}
            {summary.mainTakeaways.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryHeader}>Main Takeaways</Text>
                {summary.mainTakeaways.map((takeaway, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{takeaway}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Items */}
            {summary.actionItems.length > 0 && summary.actionItems[0] !== 'None' && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryHeader}>Action Items</Text>
                {summary.actionItems.map((action, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>□</Text>
                    <Text style={styles.bulletText}>{action}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Conversation - Only show in full transcript export */}
        {!includeSummary && (
          <View style={styles.conversationSection}>
            <Text style={styles.conversationTitle}>Conversation</Text>
            {conversation.messages.map((message) => {
              const timestamp = new Date(message.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              const isUser = message.role === 'user';
              const senderName = isUser ? 'User' : conversation.bot.name;

              return (
                <View
                  key={message.id}
                  style={[
                    styles.message,
                    isUser ? styles.userMessage : styles.assistantMessage,
                  ]}
                >
                  <View style={styles.messageHeader}>
                    <Text style={[styles.messageSender, isUser ? styles.userSender : styles.assistantSender]}>
                      {senderName}
                    </Text>
                    <Text style={styles.messageTime}>{timestamp}</Text>
                  </View>
                  <Text style={styles.messageContent}>{message.content}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Exported from RobotRecruit.AI on {new Date().toLocaleString()}</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

