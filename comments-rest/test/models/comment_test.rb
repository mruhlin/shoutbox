require 'test_helper'

class CommentTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end

  test "require comment body" do
    comment = Comment.new
    comment.user="john doe"
    comment.email="john@doe.com"
    assert_not comment.valid? "bodyless comment should be invalid"
  end

  test "require user" do
    comment = Comment.new
    comment.body="pants"
    comment.email="john@doe.com"
    assert_not comment.valid? "needs to have a user"
  end

  test "require email" do
    comment = Comment.new
    comment.user="john doe"
    comment.body="pants"
    assert_not comment.valid? "needs to have a user"
  end

  test "validate comment max length" do
    comment = Comment.new
    comment.user="John Doe"
    comment.email="john@doe.com"
    comment.body="12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890X"
    assert_not comment.valid? "141 characters should be too many"
  end

  test "validate comment min length" do
    comment = Comment.new
    comment.user="John Doe"
    comment.body=""
    comment.email="john@doe.com"
    assert_not comment.valid? "empty string not a valid comment"
  end

  test "everything valid should be ok" do
    comment = Comment.new
    comment.user="John Doe"
    comment.email="john@doe.com"
    comment.body="pants"
    assert comment.valid? 'that should be a valid comment'
  end
end
