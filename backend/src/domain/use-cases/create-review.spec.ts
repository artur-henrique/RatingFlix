import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { CreateReviewUseCase } from "./create-review.js";
import { RecalculateUserGamificationUseCase } from "./recalculate-user-gamification.js";
import { InMemoryReviewsRepository } from "../../test/repositories/in-memory-reviews-repository.js";
import { InMemoryVotesRepository } from "../../test/repositories/in-memory-votes-repository.js";
import { InMemoryBadgesRepository } from "../../test/repositories/in-memory-badges-repository.js";
import { InMemoryUserBadgesRepository } from "../../test/repositories/in-memory-user-badges-repository.js";
import { ReviewAlreadyExistsError } from "../errors/review-already-exists-error.js";
import { MockMovieService } from "../../test/services/mock-movie-service.js";
import { MovieService, MovieDetails } from "../services/movie-service.js";

let reviewsRepository: InMemoryReviewsRepository;
let movieService: MovieService;
let sut: CreateReviewUseCase; // System Under Test

describe("Create Review Use Case", () => {
  beforeEach(() => {
    reviewsRepository = new InMemoryReviewsRepository();
    const votesRepository = new InMemoryVotesRepository(reviewsRepository);
    const badgesRepository = new InMemoryBadgesRepository();
    const userBadgesRepository = new InMemoryUserBadgesRepository(badgesRepository);
    const recalculateUserGamificationUseCase = new RecalculateUserGamificationUseCase(
      reviewsRepository,
      votesRepository,
      badgesRepository,
      userBadgesRepository
    );
    movieService = new MockMovieService();
    sut = new CreateReviewUseCase(reviewsRepository, recalculateUserGamificationUseCase, movieService);
  });

  it("should be able to create a new movie review", async () => {
    const userId = randomUUID();
    const { review } = await sut.execute({
      userId,
      tmdbId: "550", // Fight Club TMDB id
      mediaType: "movie",
      rating: 5,
      content: "An absolute masterpiece. Deep sociological analysis of consumerism.",
    });

    expect(review.id).toStrictEqual(expect.any(String));
    expect(review.userId).toBe(userId);
    expect(review.tmdbId).toBe("550");
    expect(review.rating).toBe(5);
    expect(review.content).toBe("An absolute masterpiece. Deep sociological analysis of consumerism.");
    expect(review.movieTitle).toBe("Clube da Luta");
    expect(review.moviePosterPath).toBe("https://image.tmdb.org/t/p/w500/b9g7YclG97TidIl797gIIT9OC6V.jpg");
  });

  it("should create the review with a null movie snapshot when TMDB has no data for the title", async () => {
    const userId = randomUUID();

    const { review } = await sut.execute({
      userId,
      tmdbId: "non-existent-id",
      mediaType: "movie",
      rating: 3,
      content: "Não encontrei esse filme no TMDB.",
    });

    expect(review.movieTitle).toBeNull();
    expect(review.moviePosterPath).toBeNull();
  });

  it("should still create the review when the movie service fails", async () => {
    const userId = randomUUID();
    const failingMovieService: MovieService = {
      searchMovies: async () => [],
      getMovieDetails: async (): Promise<MovieDetails | null> => {
        throw new Error("TMDB is down");
      },
    };
    sut = new CreateReviewUseCase(
      reviewsRepository,
      new RecalculateUserGamificationUseCase(
        reviewsRepository,
        new InMemoryVotesRepository(reviewsRepository),
        new InMemoryBadgesRepository(),
        new InMemoryUserBadgesRepository(new InMemoryBadgesRepository())
      ),
      failingMovieService
    );

    const { review } = await sut.execute({
      userId,
      tmdbId: "550",
      mediaType: "movie",
      rating: 4,
      content: "TMDB fora do ar não deve impedir a crítica.",
    });

    expect(review.id).toStrictEqual(expect.any(String));
    expect(review.movieTitle).toBeNull();
    expect(review.moviePosterPath).toBeNull();
  });

  it("should not be able to create two reviews for the same media by the same user", async () => {
    const userId = randomUUID();

    await sut.execute({
      userId,
      tmdbId: "550",
      mediaType: "movie",
      rating: 4,
      content: "First review.",
    });

    await expect(() =>
      sut.execute({
        userId,
        tmdbId: "550",
        mediaType: "movie",
        rating: 5,
        content: "Second review try.",
      })
    ).rejects.toBeInstanceOf(ReviewAlreadyExistsError);
  });

  it("should validate rating range limits (1-5)", async () => {
    const userId = randomUUID();

    await expect(() =>
      sut.execute({
        userId,
        tmdbId: "550",
        mediaType: "movie",
        rating: 6, // too high
        content: "Amazing!",
      })
    ).rejects.toThrow();

    await expect(() =>
      sut.execute({
        userId,
        tmdbId: "550",
        mediaType: "movie",
        rating: 0, // too low
        content: "Terrible!",
      })
    ).rejects.toThrow();
  });
});
