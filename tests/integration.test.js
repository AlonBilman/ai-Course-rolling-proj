import { PollManager } from '../src/pollManager.js';

let pollManager;

beforeEach(() => {
  pollManager = new PollManager();
});

describe('Poll System Integration Tests', () => {
  describe('Basic Functionality', () => {
    test('should create a poll and return an id', () => {
      // Arrange
      const question = 'What is your favorite color?';
      const options = ['Red', 'Blue', 'Green'];
      // Act
      const id = pollManager.createPoll(question, options);
      // Assert
      expect(id).toBeDefined();
      expect(typeof id).toBe('number');
      const poll = pollManager.getPoll(id);
      expect(poll.question).toBe(question.toLowerCase());
      expect(poll.options).toEqual(options.map((opt) => opt.toLowerCase()));
    });

    test('should record votes for poll options', () => {
      // Arrange
      const id = pollManager.createPoll('Best programming language?', ['JavaScript', 'C#', 'Java']);
      // Act
      pollManager.vote(id, 'JavaScript');
      pollManager.vote(id, 'C#');
      pollManager.vote(id, 'JavaScript');
      // Assert
      const results = pollManager.getResults(id);
      expect(results.totalVotes).toBe(3);
      expect(results.results.find((r) => r.option === 'javascript').votes).toBe(2);
      expect(results.results.find((r) => r.option === 'c#').votes).toBe(1);
      expect(results.results.find((r) => r.option === 'java').votes).toBe(0);
    });

    test('should retrieve all polls', () => {
      // Arrange
      const beforeCount = pollManager.getAllPolls().length;
      const id1 = pollManager.createPoll('Question 1?', ['A', 'B']);
      const id2 = pollManager.createPoll('Question 2?', ['X', 'Y']);
      // Act
      const allPolls = pollManager.getAllPolls();
      // Assert
      expect(allPolls.length).toBe(beforeCount + 2);
      expect(allPolls.some((poll) => poll.id === id1)).toBe(true);
      expect(allPolls.some((poll) => poll.id === id2)).toBe(true);
    });
  });

  describe('Individual Requirements Tests', () => {
    test('should not allow duplicate poll questions', () => {
      // Arrange
      const question = 'Duplicate question test?';
      pollManager.createPoll(question, ['Option 1', 'Option 2']);
      // Act & Assert
      expect(() => {
        pollManager.createPoll(question, ['Different', 'Options']);
      }).toThrow('A poll with this question already exists');
    });

    test('should allow polls with minimum required options (2)', () => {
      // Arrange & Act
      const id = pollManager.createPoll('Minimum options?', ['Yes', 'No']);
      // Assert
      const poll = pollManager.getPoll(id);
      expect(poll.options.length).toBe(2);
    });

    test('should trim whitespace from questions and options', () => {
      // Arrange
      const question = '  Trimmed question?  ';
      const options = ['  Option 1  ', ' Option 2 '];
      // Act
      const id = pollManager.createPoll(question, options);
      const poll = pollManager.getPoll(id);
      // Assert
      expect(poll.question).toBe('trimmed question?');
      expect(poll.options).toEqual(['option 1', 'option 2']);
    });
  });

  describe('Exception Handling', () => {
    test('should throw error when voting on non-existent poll', () => {
      // Arrange
      const nonExistentId = 9999;
      // Act & Assert
      expect(() => {
        pollManager.vote(nonExistentId, 'Any Option');
      }).toThrow(`Poll not found with id: ${nonExistentId}`);
    });

    test('should throw error when voting for non-existent option', () => {
      // Arrange
      const id = pollManager.createPoll('Error test?', ['A', 'B']);
      // Act & Assert
      expect(() => {
        pollManager.vote(id, 'Non-existent option');
      }).toThrow('Invalid poll option: Non-existent option');
    });

    test('should throw error when getting results for non-existent poll', () => {
      // Arrange
      const nonExistentId = 9999;
      // Act & Assert
      expect(() => {
        pollManager.getResults(nonExistentId);
      }).toThrow(`Poll not found with id: ${nonExistentId}`);
    });
  });

  describe('Combination Tests - Complete Flows', () => {
    test('should support complete poll lifecycle: create, vote, results', () => {
      // Arrange
      const question = 'What is your favorite pet?';
      const options = ['Dog', 'Cat', 'Fish', 'Bird'];
      // Act - Create
      const id = pollManager.createPoll(question, options);
      // Act - Vote multiple times
      pollManager.vote(id, 'Dog');
      pollManager.vote(id, 'Cat');
      pollManager.vote(id, 'Dog');
      pollManager.vote(id, 'Dog');
      pollManager.vote(id, 'Fish');
      // Act - Get results
      const results = pollManager.getResults(id);
      // Assert
      expect(results.question).toBe(question.toLowerCase());
      expect(results.totalVotes).toBe(5);
      expect(results.results.find((r) => r.option === 'dog').votes).toBe(3);
      expect(results.results.find((r) => r.option === 'cat').votes).toBe(1);
      expect(results.results.find((r) => r.option === 'fish').votes).toBe(1);
      expect(results.results.find((r) => r.option === 'bird').votes).toBe(0);
    });

    test('should handle multiple polls independently', () => {
      // Arrange
      const id1 = pollManager.createPoll('Poll 1?', ['A', 'B', 'C']);
      const id2 = pollManager.createPoll('Poll 2?', ['X', 'Y', 'Z']);
      // Act
      pollManager.vote(id1, 'A');
      pollManager.vote(id1, 'B');
      pollManager.vote(id2, 'Z');
      pollManager.vote(id2, 'Z');
      // Assert
      const results1 = pollManager.getResults(id1);
      const results2 = pollManager.getResults(id2);
      expect(results1.totalVotes).toBe(2);
      expect(results1.results.find((r) => r.option === 'a').votes).toBe(1);
      expect(results1.results.find((r) => r.option === 'b').votes).toBe(1);
      expect(results2.totalVotes).toBe(2);
      expect(results2.results.find((r) => r.option === 'z').votes).toBe(2);
    });
  });
});
