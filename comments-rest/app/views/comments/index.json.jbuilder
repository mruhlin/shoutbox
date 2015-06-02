json.array!(@comments) do |comment|
  json.extract! comment, :id, :user, :email, :body, :photo_id, :created_at
  json.url comment_url(comment, format: :json)
end
