class CommentsStreamController < ActionController::Base
  include ActionController::Live

  def initialize(options = {})
    @redis = Redis.new
  end

  def stream
    begin
      response.headers['Content-Type'] = 'text/event-stream'
      sse = SSE.new(response.stream, retry: 300, event:"newcomment")

      url = params['url']
      url_hash = Digest::MD5.hexdigest(url)

      channel_name = 'new-comment-' + url_hash

      #redis = Redis.new
      @redis.subscribe(channel_name) do |on|
        on.message do |event, data|
          sse.write(data)
        end
      end
    rescue IOError
        # client closed connection, and that's ok.
    ensure
      sse.close
    end
   end
end
