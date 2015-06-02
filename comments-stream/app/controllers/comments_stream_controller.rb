class CommentsStreamController < ActionController::Base
  include ActionController::Live

  def initialize(options = {})
    @redis = Redis.new
  end

  def stream
    begin
      response.headers['Content-Type'] = 'text/event-stream'
      sse = SSE.new(response.stream, retry: 300, event:"newcomment")

      #redis = Redis.new
      @redis.subscribe('new-comment') do |on|
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
