class Comment < ActiveRecord::Base
  validates :user, presence: true
  validates :body, presence: true, length: {minimum: 0, maximum: 140}
  validates :email, email_format: { message: "that's not a real email address" }

  after_create {|comment| comment.new_comment_message}

  def new_comment_message
    msg = { resource: 'comments',
            id: self.id,
            obj: self }

    $redis.publish 'new-comment', msg.to_json
  end
end
