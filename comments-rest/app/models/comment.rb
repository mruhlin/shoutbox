class Comment < ActiveRecord::Base
  validates :user, presence: true
  validates :body, presence: true, length: {minimum: 0, maximum: 140}
  validates :email, email_format: { message: "that's not a real email address" }

  after_create {|comment| comment.new_comment_message}

  before_save :default_values
  def default_values
    self.url ||= 'http://www.unspecified.example'
  end

  def new_comment_message
    msg = { resource: 'comments',
            id: self.id,
            obj: self }


    $redis.publish 'new-comment-' + Digest::MD5.hexdigest(url), msg.to_json
  end
end
